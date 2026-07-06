import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function History() {
  const navigate = useNavigate()
  const userId = localStorage.getItem('userId')
  const [historyList, setHistoryList] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId) {
        setLoading(false)
        return
      }
      try {
        const response = await axios.get(`http://localhost:8080/api/history/user/${userId}`)
        setHistoryList(response.data)
      } catch (error) {
        console.error('Error fetching history:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [userId])

  // Helper to format seconds to MM:SS
  const formatTime = (timeStr) => {
    const seconds = parseFloat(timeStr)
    if (isNaN(seconds)) return timeStr
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    const ms = Math.round((seconds % 1) * 100)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
  }

  // Filter records based on search query (by keyword name or target audio name)
  const filteredRecords = historyList.filter((item) => {
    const keyword = item.keywordSample?.keywordName || ''
    const audioName = item.searchResult?.targetAudio?.targetName || ''
    return (
      keyword.toLowerCase().includes(search.toLowerCase()) ||
      audioName.toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navBrand}>FSLAKWS HISTORY</div>
        <button style={styles.backButton} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>

      <div style={styles.content}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Search Scan History</h3>
            <p style={styles.cardDesc}>
              Track previous scans and detected keyword occurrences.
            </p>
          </div>

          <input
            type="text"
            style={styles.searchBox}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Filter by keyword or audio file name..."
          />

          {loading ? (
            <div style={styles.infoText}>Loading search history...</div>
          ) : filteredRecords.length === 0 ? (
            <div style={styles.infoText}>
              {historyList.length === 0
                ? 'No searches have been recorded yet.'
                : 'No matching history records found.'}
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.th}>Keyword</th>
                    <th style={styles.th}>Audio File</th>
                    <th style={styles.th}>Detected Time</th>
                    <th style={styles.th}>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((item, idx) => (
                    <tr style={styles.tr} key={item.historyId || idx}>
                      <td style={styles.tdKeyword}>
                        <span style={styles.badge}>🔑 {item.keywordSample?.keywordName}</span>
                      </td>
                      <td style={styles.td}>{item.searchResult?.targetAudio?.targetName}</td>
                      <td style={styles.tdTime}>{formatTime(item.searchResult?.startTime)}</td>
                      <td style={styles.tdScore}>
                        <span style={styles.statusBadge}>✓ Match</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
    padding: '40px 20px',
    display: 'flex',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    border: '1px solid rgba(11, 25, 44, 0.08)',
    borderRadius: '24px',
    width: '100%',
    maxWidth: '900px',
    boxShadow: '0 20px 50px rgba(11, 25, 44, 0.05)',
    padding: '40px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  cardTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '800',
    color: '#0B192C',
  },
  cardDesc: {
    margin: 0,
    fontSize: '14px',
    color: '#5C6E82',
    fontWeight: '500',
  },
  searchBox: {
    padding: '12px 16px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #D2D6DC',
    borderRadius: '10px',
    color: '#0B192C',
    fontSize: '15px',
    outline: 'none',
    fontWeight: '500',
  },
  infoText: {
    textAlign: 'center',
    padding: '40px 0',
    color: '#5C6E82',
    fontSize: '15px',
    fontStyle: 'italic',
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '12px',
    border: '1px solid rgba(11, 25, 44, 0.08)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#FFFFFF',
  },
  tableHeaderRow: {
    backgroundColor: '#0B192C',
    borderBottom: '2px solid #0B192C',
  },
  th: {
    textAlign: 'left',
    padding: '16px 20px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#FBBF24',
  },
  tr: {
    borderBottom: '1px solid #E2E8F0',
    transition: 'background-color 0.2s',
  },
  td: {
    padding: '16px 20px',
    fontSize: '14px',
    color: '#0B192C',
    fontWeight: '500',
  },
  tdKeyword: {
    padding: '16px 20px',
  },
  tdTime: {
    padding: '16px 20px',
    fontSize: '16px',
    fontWeight: '800',
    color: '#0B192C',
  },
  tdScore: {
    padding: '16px 20px',
  },
  badge: {
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    color: '#F5A623',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '700',
    border: '1px solid rgba(245, 166, 35, 0.2)',
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '700',
    border: '1px solid rgba(16, 185, 129, 0.2)',
  },
}

export default History