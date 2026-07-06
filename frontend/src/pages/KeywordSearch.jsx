import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function KeywordSearch() {
  const navigate = useNavigate()
  const userId = localStorage.getItem('userId')
  const [activeTab, setActiveTab] = useState('enroll') // 'enroll' | 'search'

  // Enrollment State
  const [keywordName, setKeywordName] = useState('')
  const [enrollFiles, setEnrollFiles] = useState([null, null, null, null, null])
  const [inputModes, setInputModes] = useState(['upload', 'upload', 'upload', 'upload', 'upload']) // 'upload' | 'record' for each
  const [isEnrolling, setIsEnrolling] = useState(false)

  // Recording State Management
  const [recordingStates, setRecordingStates] = useState([false, false, false, false, false])
  const [audioUrls, setAudioUrls] = useState([null, null, null, null, null])
  const mediaRecorders = useRef([null, null, null, null, null])
  const audioChunks = useRef([[], [], [], [], []])

  // Search State
  const [enrolledKeywords, setEnrolledKeywords] = useState([])
  const [selectedKeyword, setSelectedKeyword] = useState('')
  const [targetFile, setTargetFile] = useState(null)
  const [isSearching, setIsSearching] = useState(false)

  // Fetch enrolled keywords for dropdown
  const fetchKeywords = async () => {
    if (!userId) return
    try {
      const response = await axios.get(`http://localhost:8080/api/keywords/user/${userId}`)
      // Extract unique keyword names
      const uniqueNames = [...new Set(response.data.map(item => item.keywordName))]
      setEnrolledKeywords(uniqueNames)
      if (uniqueNames.length > 0 && !selectedKeyword) {
        setSelectedKeyword(uniqueNames[0])
      }
    } catch (error) {
      console.error('Error fetching keywords:', error)
    }
  }

  useEffect(() => {
    fetchKeywords()
  }, [userId])

  // Handle uploaded files
  const handleFileChange = (index, file) => {
    const updatedFiles = [...enrollFiles]
    updatedFiles[index] = file
    setEnrollFiles(updatedFiles)
  }

  // Native Microphone Recording
  const startRecording = async (index) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorders.current[index] = mediaRecorder
      audioChunks.current[index] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current[index].push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks.current[index], { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(audioBlob)
        
        // Save to audio URL for playing in browser
        const updatedUrls = [...audioUrls]
        updatedUrls[index] = audioUrl
        setAudioUrls(updatedUrls)

        // Save as File to upload list
        const file = new File([audioBlob], `recorded_sample_${index + 1}.webm`, { type: 'audio/webm' })
        const updatedFiles = [...enrollFiles]
        updatedFiles[index] = file
        setEnrollFiles(updatedFiles)

        // Stop stream tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      
      const updatedStates = [...recordingStates]
      updatedStates[index] = true
      setRecordingStates(updatedStates)
    } catch (err) {
      console.error('Microphone access denied:', err)
      alert('Microphone access is required to record audio samples!')
    }
  }

  const stopRecording = (index) => {
    const recorder = mediaRecorders.current[index]
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop()
      
      const updatedStates = [...recordingStates]
      updatedStates[index] = false
      setRecordingStates(updatedStates)
    }
  }

  const clearRecording = (index) => {
    const updatedUrls = [...audioUrls]
    updatedUrls[index] = null
    setAudioUrls(updatedUrls)

    const updatedFiles = [...enrollFiles]
    updatedFiles[index] = null
    setEnrollFiles(updatedFiles)
  }

  const handleModeChange = (index, mode) => {
    const updatedModes = [...inputModes]
    updatedModes[index] = mode
    setInputModes(updatedModes)

    // Clear file selection when switching modes
    const updatedFiles = [...enrollFiles]
    updatedFiles[index] = null
    setEnrollFiles(updatedFiles)

    const updatedUrls = [...audioUrls]
    updatedUrls[index] = null
    setAudioUrls(updatedUrls)
  }

  // Submit Enrollment
  const handleEnroll = async (e) => {
    e.preventDefault()
    if (!keywordName.trim()) {
      alert('Please enter a keyword name!')
      return
    }
    const filledFiles = enrollFiles.filter(f => f !== null)
    if (filledFiles.length !== 5) {
      alert('Please provide all 5 audio samples (either upload or record)!')
      return
    }

    setIsEnrolling(true)
    const formData = new FormData()
    formData.append('userId', userId)
    formData.append('keywordName', keywordName.trim())
    filledFiles.forEach(file => {
      formData.append('files', file)
    })

    try {
      const enrolledWord = keywordName.trim()
      await axios.post('http://localhost:8080/api/keywords/enroll', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      alert(`Keyword "${enrolledWord}" successfully verified and enrolled!`)
      setKeywordName('')
      setEnrollFiles([null, null, null, null, null])
      setAudioUrls([null, null, null, null, null])
      setSelectedKeyword(enrolledWord)
      await fetchKeywords()
      setActiveTab('search')
    } catch (error) {
      console.error(error)
      if (error.response?.data?.transcripts) {
        const trs = error.response.data.transcripts.map((t, idx) => `Sample #${idx + 1}: ${t || '(silent)'}`).join('\n')
        alert(`VERIFICATION ERROR: The 5 keyword audio samples do not contain the same word!\n\nDetected Transcripts:\n${trs}`)
      } else {
        alert(error.response?.data?.message || error.response?.data?.error || 'Failed to enroll keyword.')
      }
    } finally {
      setIsEnrolling(false)
    }
  }

  // Submit Search
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!selectedKeyword) {
      alert('Please select or enroll a keyword first!')
      return
    }
    if (!targetFile) {
      alert('Please upload a target audio file to search in!')
      return
    }

    setIsSearching(true)
    const formData = new FormData()
    formData.append('userId', userId)
    formData.append('keywordName', selectedKeyword)
    formData.append('targetAudio', targetFile)

    try {
      const response = await axios.post('http://localhost:8080/api/search/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      // Save search summary to localStorage for Results page
      const resultsSummary = {
        keyword: selectedKeyword,
        targetName: targetFile.name,
        matches: response.data
      }
      localStorage.setItem('lastSearchResults', JSON.stringify(resultsSummary))
      navigate('/results')
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || 'Error occurred during keyword search.')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navBrand}>FSLAKWS</div>
        <button style={styles.backButton} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>

      <div style={styles.content}>
        <div style={styles.card}>
          {/* Tabs */}
          <div style={styles.tabsHeader}>
            <button
              style={activeTab === 'enroll' ? styles.activeTabBtn : styles.tabBtn}
              onClick={() => setActiveTab('enroll')}
            >
              🎤 Enroll Keyword
            </button>
            <button
              style={activeTab === 'search' ? styles.activeTabBtn : styles.tabBtn}
              onClick={() => setActiveTab('search')}
            >
              🔍 Search Audio
            </button>
          </div>

          <div style={styles.tabsContent}>
            {activeTab === 'enroll' ? (
              <form onSubmit={handleEnroll} style={styles.form}>
                <h3 style={styles.sectionTitle}>Enroll a New Keyword</h3>
                <p style={styles.sectionDesc}>
                  Enter the keyword name and record or upload exactly 5 speech samples. The system will verify that all 5 samples contain the same word before training.
                </p>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Keyword Name</label>
                  <input
                    type="text"
                    style={styles.textInput}
                    placeholder="e.g., hello, start, pause"
                    value={keywordName}
                    onChange={(e) => setKeywordName(e.target.value)}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Audio Samples (exactly 5 samples required)</label>
                  <div style={styles.fileGrid}>
                    {enrollFiles.map((file, idx) => (
                      <div key={idx} style={styles.sampleRow}>
                        <div style={styles.sampleHeader}>
                          <span style={styles.fileLabel}>Sample #{idx + 1}</span>
                          <div style={styles.modeButtons}>
                            <button
                              type="button"
                              style={inputModes[idx] === 'upload' ? styles.modeActive : styles.modeInactive}
                              onClick={() => handleModeChange(idx, 'upload')}
                            >
                              📁 Upload
                            </button>
                            <button
                              type="button"
                              style={inputModes[idx] === 'record' ? styles.modeActive : styles.modeInactive}
                              onClick={() => handleModeChange(idx, 'record')}
                            >
                              🎙️ Record
                            </button>
                          </div>
                        </div>

                        <div style={styles.sampleInputBody}>
                          {inputModes[idx] === 'upload' ? (
                            <input
                              type="file"
                              accept="audio/wav,audio/*"
                              style={styles.fileInput}
                              onChange={(e) => handleFileChange(idx, e.target.files[0])}
                              required={inputModes[idx] === 'upload'}
                            />
                          ) : (
                            <div style={styles.recordingInterface}>
                              {!audioUrls[idx] ? (
                                !recordingStates[idx] ? (
                                  <button
                                    type="button"
                                    style={styles.recordStartBtn}
                                    onClick={() => startRecording(idx)}
                                  >
                                    🔴 Record
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    style={styles.recordStopBtn}
                                    onClick={() => stopRecording(idx)}
                                  >
                                    ⏹ Stop Recording...
                                  </button>
                                )
                              ) : (
                                <div style={styles.recordedPlayback}>
                                  <audio src={audioUrls[idx]} controls style={styles.audioPlayer} />
                                  <button
                                    type="button"
                                    style={styles.clearRecBtn}
                                    onClick={() => clearRecording(idx)}
                                  >
                                    🗑️ Reset
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={isEnrolling} style={styles.actionButton}>
                  {isEnrolling ? 'Verifying & Saving Keyword...' : '🚀 Enroll & Verify Keyword'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSearch} style={styles.form}>
                <h3 style={styles.sectionTitle}>Scan Audio for Keyword</h3>
                <p style={styles.sectionDesc}>
                  Select an enrolled keyword and upload a target audio recording. (Target input is **upload-only**).
                </p>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Select Enrolled Keyword</label>
                  {enrolledKeywords.length === 0 ? (
                    <div style={styles.noKeywordsAlert}>
                      ⚠️ No keywords enrolled yet. Please go to the <strong>Enroll Keyword</strong> tab first!
                    </div>
                  ) : (
                    <select
                      style={styles.selectInput}
                      value={selectedKeyword}
                      onChange={(e) => setSelectedKeyword(e.target.value)}
                      required
                    >
                      {enrolledKeywords.map((kw, idx) => (
                        <option key={idx} value={kw}>
                          {kw}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Upload Target Audio Recording (Upload Only)</label>
                  <input
                    type="file"
                    accept="audio/*"
                    style={styles.fileInputTarget}
                    onChange={(e) => setTargetFile(e.target.files[0])}
                    required
                  />
                </div>

                {isSearching ? (
                  <div style={styles.loadingContainer}>
                    <div style={styles.pulseContainer}>
                      <span style={styles.pulseBar}></span>
                      <span style={styles.pulseBar}></span>
                      <span style={styles.pulseBar}></span>
                      <span style={styles.pulseBar}></span>
                      <span style={styles.pulseBar}></span>
                    </div>
                    <p style={styles.loadingText}>Verifying Template & Scanning Target Audio...</p>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={enrolledKeywords.length === 0}
                    style={enrolledKeywords.length === 0 ? styles.disabledButton : styles.actionButton}
                  >
                    🔥 Start Search Scan
                  </button>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#FCFBF4',
    color: '#0B192C',
    fontFamily: "'Outfit', sans-serif",
  },
  navbar: {
    background: '#0B192C',
    borderBottom: '4px solid #FBBF24',
    padding: '16px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 20px rgba(11, 25, 44, 0.08)',
  },
  navBrand: {
    fontSize: '22px',
    fontWeight: '900',
    color: '#FBBF24',
    letterSpacing: '1.5px',
  },
  backButton: {
    padding: '8px 18px',
    backgroundColor: 'transparent',
    color: '#FBBF24',
    border: '2px solid #FBBF24',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  content: {
    padding: '40px 20px',
    display: 'flex',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    border: '1px solid rgba(11, 25, 44, 0.08)',
    borderRadius: '24px',
    width: '100%',
    maxWidth: '750px',
    boxShadow: '0 20px 50px rgba(11, 25, 44, 0.06)',
    overflow: 'hidden',
  },
  tabsHeader: {
    display: 'flex',
    backgroundColor: '#F1F3F5',
    borderRadius: '12px',
    padding: '6px',
    margin: '32px 32px 0 32px',
  },
  tabBtn: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'transparent',
    color: '#5C6E82',
    border: 'none',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    borderRadius: '8px',
  },
  activeTabBtn: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#FFFFFF',
    color: '#0B192C',
    border: 'none',
    fontSize: '15px',
    fontWeight: '800',
    cursor: 'pointer',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  tabsContent: {
    padding: '32px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  sectionTitle: {
    margin: '0 0 8px 0',
    fontSize: '22px',
    fontWeight: '800',
    color: '#0B192C',
  },
  sectionDesc: {
    margin: 0,
    fontSize: '14px',
    color: '#5C6E82',
    lineHeight: '1.6',
    fontWeight: '500',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#0B192C',
  },
  textInput: {
    padding: '12px 16px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #D2D6DC',
    borderRadius: '10px',
    color: '#0B192C',
    fontSize: '15px',
    outline: 'none',
    fontWeight: '500',
  },
  selectInput: {
    padding: '12px 16px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #D2D6DC',
    borderRadius: '10px',
    color: '#0B192C',
    fontSize: '15px',
    outline: 'none',
    cursor: 'pointer',
    fontWeight: '600',
  },
  fileGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    backgroundColor: '#FCFBF4',
    padding: '20px',
    borderRadius: '16px',
    border: '1px solid #D2D6DC',
  },
  sampleRow: {
    borderBottom: '1px solid #E2E8F0',
    paddingBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  sampleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileLabel: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0B192C',
  },
  modeButtons: {
    display: 'flex',
    gap: '6px',
  },
  modeActive: {
    padding: '4px 12px',
    backgroundColor: '#0B192C',
    color: '#FBBF24',
    border: 'none',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'default',
  },
  modeInactive: {
    padding: '4px 12px',
    backgroundColor: 'transparent',
    color: '#0B192C',
    border: '1px solid #0B192C',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  sampleInputBody: {
    paddingLeft: '4px',
  },
  fileInput: {
    color: '#0B192C',
    fontSize: '13px',
    fontWeight: '600',
  },
  fileInputTarget: {
    padding: '30px 20px',
    backgroundColor: '#FCFBF4',
    border: '2px dashed #D2D6DC',
    borderRadius: '12px',
    color: '#0B192C',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '600',
    textAlign: 'center',
    transition: 'border-color 0.2s',
  },
  recordingInterface: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  recordStartBtn: {
    padding: '8px 16px',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
  },
  recordStopBtn: {
    padding: '8px 16px',
    backgroundColor: '#0B192C',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    animation: 'pulseRed 1.5s infinite',
  },
  recordedPlayback: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
  },
  audioPlayer: {
    height: '32px',
    flex: 1,
  },
  clearRecBtn: {
    padding: '6px 12px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  actionButton: {
    padding: '14px 28px',
    background: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
    color: '#0B192C',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    boxShadow: '0 4px 14px rgba(245, 158, 11, 0.2)',
  },
  disabledButton: {
    padding: '14px 28px',
    backgroundColor: 'rgba(11, 25, 44, 0.1)',
    color: 'rgba(11, 25, 44, 0.4)',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'not-allowed',
  },
  noKeywordsAlert: {
    padding: '16px',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '8px',
    color: '#ef4444',
    fontSize: '14px',
    lineHeight: '1.5',
    fontWeight: '600',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    padding: '20px 0',
  },
  loadingText: {
    fontSize: '14px',
    color: '#0B192C',
    fontWeight: '700',
  },
  pulseContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    height: '40px',
  },
  pulseBar: {
    width: '4px',
    height: '20px',
    backgroundColor: '#0B192C',
    borderRadius: '2px',
    animation: 'wave 1.2s ease-in-out infinite',
  },
}

// Add CSS keyframe injections dynamically for animations
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.type = 'text/css'
  styleSheet.innerText = `
    @keyframes wave {
      0%, 100% { height: 10px; opacity: 0.5; }
      50% { height: 40px; opacity: 1; }
    }
    @keyframes pulseRed {
      0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
      100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }
    .pulseBar:nth-child(1) { animation-delay: -0.4s; }
    .pulseBar:nth-child(2) { animation-delay: -0.3s; }
    .pulseBar:nth-child(3) { animation-delay: -0.2s; }
    .pulseBar:nth-child(4) { animation-delay: -0.1s; }
  `
  document.head.appendChild(styleSheet)
}

export default KeywordSearch