import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Results() {
  const navigate = useNavigate()
  const [resultsData, setResultsData] = useState(null)

  useEffect(() => {
    const raw = localStorage.getItem('lastSearchResults')
    if (raw) {
      setResultsData(JSON.parse(raw))
    }
  }, [])

  if (!resultsData) {
    return (
      <div style={styles.container}>
        <div style={styles.navbar}>
          <div style={styles.navBrand}>FSLAKWS</div>
        </div>
        <div style={styles.noResults}>
          <h3>No Search Results Found</h3>
          <p>Please perform a keyword search first.</p>
          <button style={styles.actionButton} onClick={() => navigate('/keyword-search')}>
            Go to Search
          </button>
        </div>
      </div>
    )
  }

  const { keyword, targetName, matches } = resultsData

  // Helper to format seconds to MM:SS
  const formatTime = (timeStr) => {
    const seconds = parseFloat(timeStr)
    if (isNaN(seconds)) return timeStr
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    const ms = Math.round((seconds % 1) * 100)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
  }

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navBrand}>FSLAKWS RESULTS</div>
        <button style={styles.backButton} onClick={() => navigate('/keyword-search')}>
          New Search
        </button>
      </div>

      <div style={styles.content}>
        {/* Header Cards */}
        <div style={styles.grid}>
          <div style={styles.statCard}>
            <span style={styles.statTitle}>Keyword Searched</span>
            <span style={styles.statValue}>🔑 {keyword}</span>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statTitle}>Occurrences Found</span>
            <span style={{ ...styles.statValue, color: matches.length > 0 ? '#f59e0b' : '#ef4444' }}>
              🎯 {matches.length}
            </span>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statTitle}>Target Audio Source</span>
            <span style={styles.statValueSource} title={targetName}>
              📁 {targetName.length > 25 ? targetName.substring(0, 25) + '...' : targetName}
            </span>
          </div>
        </div>

        {/* Timeline / Match details */}
        <div style={styles.resultsCard}>
          <h3 style={styles.cardTitle}>Detected Timestamps</h3>
          <p style={styles.cardDesc}>
            Below are the specific timestamps within the audio where the keyword was detected.
          </p>

          {matches.length === 0 ? (
            <div style={styles.noMatchAlert}>
              📭 No matches detected for "{keyword}" in the target audio. Try adjusting the search or enrolling clearer keyword samples.
            </div>
          ) : (
            <div style={styles.timeline}>
              {matches.map((match, idx) => (
                <div key={idx} style={styles.timelineItem}>
                  <div style={styles.timelineBadge}>{idx + 1}</div>
                  <div style={styles.timelineContent}>
                    <div style={styles.timeLabel}>{formatTime(match.startTime || match.time)}</div>
                    <div style={styles.scoreText}>
                      Match Confidence Index: <span style={styles.scoreVal}>{match.score || 'High'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
    padding: '60px 40px',
    maxWidth: '1000px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
  },
  grid: {
    display: 'flex',
    gap: '30px',
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: '250px',
    backgroundColor: '#FFFFFF',
    border: '1px solid rgba(11, 25, 44, 0.08)',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    boxShadow: '0 10px 30px rgba(11, 25, 44, 0.02)',
    borderTop: '4px solid #FBBF24',
  },
  statTitle: {
    fontSize: '13px',
    color: '#5C6E82',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: '700',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#0B192C',
  },
  statValueSource: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0B192C',
    wordBreak: 'break-all',
  },
  resultsCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid rgba(11, 25, 44, 0.08)',
    borderRadius: '24px',
    padding: '40px 32px',
    boxShadow: '0 20px 50px rgba(11, 25, 44, 0.05)',
  },
  cardTitle: {
    margin: '0 0 8px 0',
    fontSize: '22px',
    fontWeight: '800',
    color: '#0B192C',
  },
  cardDesc: {
    margin: '0 0 24px 0',
    fontSize: '14px',
    color: '#5C6E82',
    fontWeight: '500',
  },
  noMatchAlert: {
    padding: '20px',
    backgroundColor: '#FFFFFF',
    border: '1px solid rgba(11, 25, 44, 0.08)',
    borderRadius: '12px',
    color: '#D32F2F',
    fontSize: '15px',
    lineHeight: '1.6',
    fontWeight: '600',
    textAlign: 'center',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    position: 'relative',
    paddingLeft: '20px',
    borderLeft: '2px solid #E2E8F0',
  },
  timelineItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    position: 'relative',
  },
  timelineBadge: {
    position: 'absolute',
    left: '-31px',
    width: '20px',
    height: '20px',
    backgroundColor: '#0B192C',
    color: '#FBBF24',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '800',
    border: '2px solid #FFFDF0',
  },
  timelineContent: {
    backgroundColor: '#FCFBF4',
    border: '1px solid rgba(11, 25, 44, 0.08)',
    borderRadius: '12px',
    padding: '16px 24px',
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  timeLabel: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#0B192C',
  },
  scoreText: {
    fontSize: '13px',
    color: '#5C6E82',
    fontWeight: '600',
  },
  scoreVal: {
    color: '#0B192C',
    fontWeight: '800',
  },
  noResults: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '100px 20px',
    color: '#0B192C',
  },
  actionButton: {
    padding: '14px 28px',
    background: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
    color: '#0B192C',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '800',
    cursor: 'pointer',
    marginTop: '12px',
    boxShadow: '0 4px 14px rgba(245, 158, 11, 0.2)',
  },
}

export default Results
