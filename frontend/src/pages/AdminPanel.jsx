import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function AdminPanel() {
  const navigate = useNavigate()
  const loggedInRole = localStorage.getItem('userRole')

  // User Directory State
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)

  // Selected User for viewing works
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedUserKeywords, setSelectedUserKeywords] = useState([])

  // Global search logs
  const [logs, setLogs] = useState([])
  const [loadingLogs, setLoadingLogs] = useState(true)

  // Security check: Only allow admins
  useEffect(() => {
    if (loggedInRole !== 'ADMIN') {
      alert('Access Denied: Administrative privileges required!')
      navigate('/dashboard')
    }
  }, [loggedInRole, navigate])

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const response = await axios.get('http://localhost:8080/api/users')
      setUsers(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchLogs = async () => {
    setLoadingLogs(true)
    try {
      const response = await axios.get('http://localhost:8080/api/history')
      setLogs(response.data)
    } catch (error) {
      console.error('Error fetching system logs:', error)
    } finally {
      setLoadingLogs(false)
    }
  }

  useEffect(() => {
    if (loggedInRole === 'ADMIN') {
      fetchUsers()
      fetchLogs()
    }
  }, [loggedInRole])

  // Fetch keywords for the selected user
  const handleSelectUser = async (user) => {
    setSelectedUser(user)
    try {
      const response = await axios.get(`http://localhost:8080/api/keywords/user/${user.userId}`)
      // Extract unique keyword names
      const uniqueNames = [...new Set(response.data.map(item => item.keywordName))]
      setSelectedUserKeywords(uniqueNames)
    } catch (error) {
      console.error('Error fetching user keywords:', error)
      setSelectedUserKeywords([])
    }
  }

  // Delete user account
  const handleDeleteUser = async (e, id, name) => {
    e.stopPropagation() // Prevent selecting the user row
    if (window.confirm(`Are you sure you want to delete the user account for "${name}"?`)) {
      try {
        await axios.delete(`http://localhost:8080/api/users/${id}`)
        alert('User successfully deleted.')
        if (selectedUser?.userId === id) {
          setSelectedUser(null)
        }
        fetchUsers()
        fetchLogs()
      } catch (error) {
        console.error('Error deleting user:', error)
        alert('Failed to delete user. Please try again.')
      }
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userRole')
    navigate('/')
  }

  // Format time (MM:SS)
  const formatTime = (timeStr) => {
    const seconds = parseFloat(timeStr)
    if (isNaN(seconds)) return timeStr
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Filter logs for selected user
  const selectedUserLogs = logs.filter(log => log.user?.userId === selectedUser?.userId)

  return (
    <div style={styles.container}>
      {/* Centered Page Header */}
      <h1 style={styles.pageHeader}>ADMIN PANEL</h1>

      <div style={styles.content}>
        {/* Main Directory Yellow Card */}
        <div style={styles.yellowCard}>
          {/* Card Header Top Bar */}
          <div style={styles.cardHeader}>
            <span style={styles.brandTitle}>FSLAKWS ADMIN</span>
            <button style={styles.logoutBtn} onClick={handleLogout}>
              LOG OUT
            </button>
          </div>

          <div style={styles.divider} />

          {/* Subtitle */}
          <h2 style={styles.allUsersTitle}>All users</h2>

          {/* User Directory Table */}
          {loadingUsers ? (
            <div style={styles.loadingText}>Loading user directories...</div>
          ) : users.length === 0 ? (
            <div style={styles.loadingText}>No users registered in system.</div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.th}>NAME</th>
                    <th style={styles.th}>EMAIL</th>
                    <th style={styles.th}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      style={{
                        ...styles.tr,
                        backgroundColor: selectedUser?.userId === user.userId ? '#FFF9D4' : '#FEFBDC'
                      }}
                      key={user.userId}
                      onClick={() => handleSelectUser(user)}
                    >
                      <td style={styles.tdName}>
                        👤 {user.name} {user.role === 'ADMIN' && <span style={styles.adminLabel}>(Admin)</span>}
                      </td>
                      <td style={styles.tdEmail}>{user.email}</td>
                      <td style={styles.tdAction}>
                        {user.role === 'ADMIN' ? (
                          <span style={styles.protectedText}>Protected</span>
                        ) : (
                          <button
                            style={styles.deleteBtn}
                            onClick={(e) => handleDeleteUser(e, user.userId, user.name)}
                          >
                            DELETE
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Total Searches Count */}
          <div style={styles.footerCount}>
            TOTAL SEARCHES: {logs.length}
          </div>
        </div>

        {/* User Works Detailed Drawer (Visible on touching a user row) */}
        {selectedUser && (
          <div style={styles.worksCard}>
            <div style={styles.worksHeader}>
              <h3 style={styles.worksTitle}>Works of {selectedUser.name}</h3>
              <button style={styles.closeBtn} onClick={() => setSelectedUser(null)}>
                ✖ Close Details
              </button>
            </div>

            <div style={styles.worksGrid}>
              {/* Enrolled Keywords List */}
              <div style={styles.worksCol}>
                <h4 style={styles.colTitle}>🔑 Enrolled Keywords</h4>
                {selectedUserKeywords.length === 0 ? (
                  <p style={styles.noWorksText}>No keywords enrolled by this user.</p>
                ) : (
                  <ul style={styles.list}>
                    {selectedUserKeywords.map((kw, idx) => (
                      <li key={idx} style={styles.listItem}>
                        ✨ {kw}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Search Scan Histories */}
              <div style={styles.worksCol}>
                <h4 style={styles.colTitle}>📜 Scan Run History</h4>
                {selectedUserLogs.length === 0 ? (
                  <p style={styles.noWorksText}>No search scans run by this user.</p>
                ) : (
                  <div style={styles.historyScroll}>
                    {selectedUserLogs.map((log, idx) => (
                      <div key={idx} style={styles.historyRow}>
                        <div style={styles.historyAudio}>
                          🎵 {log.searchResult?.targetAudio?.targetName}
                        </div>
                        <div style={styles.historyMeta}>
                          Keyword: <strong>{log.keywordSample?.keywordName}</strong> | Hit Time: <strong style={{ color: '#0B2545' }}>{formatTime(log.searchResult?.startTime)}s</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
        ⬅ Return to Dashboard
      </button>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#FCFBF4',
    color: '#0B192C',
    fontFamily: "'Outfit', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
  },
  pageHeader: {
    fontSize: '28px',
    fontWeight: '900',
    color: '#0B192C',
    margin: '0 0 24px 0',
    letterSpacing: '2px',
    textAlign: 'center',
  },
  content: {
    width: '100%',
    maxWidth: '600px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  yellowCard: {
    backgroundColor: '#FFB300',
    border: '3px solid #0B192C',
    borderRadius: '24px',
    padding: '32px 24px',
    boxShadow: '0 10px 30px rgba(11, 25, 44, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#0B192C',
    letterSpacing: '0.5px',
  },
  logoutBtn: {
    padding: '6px 14px',
    backgroundColor: '#D32F2F',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(211, 47, 47, 0.3)',
    transition: 'all 0.2s',
  },
  divider: {
    height: '2px',
    backgroundColor: '#0B192C',
  },
  allUsersTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '800',
    color: '#0B192C',
  },
  loadingText: {
    textAlign: 'center',
    padding: '20px 0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#0B192C',
    fontStyle: 'italic',
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '12px',
    border: '2px solid #0B192C',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#FFFDF0',
  },
  tableHeaderRow: {
    backgroundColor: '#FFFDF0',
    borderBottom: '2px solid #0B192C',
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    fontSize: '13px',
    fontWeight: '800',
    color: '#0B192C',
    borderRight: '2px solid #0B192C',
  },
  tr: {
    borderBottom: '2px solid #0B192C',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  tdName: {
    padding: '12px 16px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#0B192C',
    borderRight: '2px solid #0B192C',
  },
  tdEmail: {
    padding: '12px 16px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#0B192C',
    borderRight: '2px solid #0B192C',
    wordBreak: 'break-all',
  },
  tdAction: {
    padding: '12px 16px',
    textAlign: 'center',
  },
  adminLabel: {
    fontSize: '10px',
    color: '#7B1FA2',
    fontWeight: '800',
  },
  protectedText: {
    fontSize: '11px',
    color: '#7B1FA2',
    fontWeight: '800',
    fontStyle: 'italic',
  },
  deleteBtn: {
    padding: '4px 10px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '800',
    cursor: 'pointer',
  },
  footerCount: {
    textAlign: 'center',
    fontSize: '15px',
    fontWeight: '900',
    color: '#0B192C',
    letterSpacing: '0.5px',
    marginTop: '8px',
  },
  worksCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid rgba(11, 25, 44, 0.08)',
    borderRadius: '24px',
    padding: '32px 24px',
    boxShadow: '0 20px 50px rgba(11, 25, 44, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    borderTop: '6px solid #0B192C',
  },
  worksHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #E2E8F0',
    paddingBottom: '12px',
  },
  worksTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '800',
    color: '#0B192C',
  },
  closeBtn: {
    padding: '4px 10px',
    backgroundColor: 'transparent',
    color: '#0B192C',
    border: '1px solid #0B192C',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  worksGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  worksCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  colTitle: {
    margin: 0,
    fontSize: '13px',
    fontWeight: '800',
    color: '#0B192C',
  },
  noWorksText: {
    margin: 0,
    fontSize: '12px',
    color: '#5C6E82',
    fontStyle: 'italic',
  },
  list: {
    margin: 0,
    paddingLeft: '16px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#0B192C',
  },
  listItem: {
    marginBottom: '4px',
  },
  historyScroll: {
    maxHeight: '150px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: '#FCFBF4',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #D2D6DC',
  },
  historyRow: {
    borderBottom: '1px solid rgba(11, 25, 44, 0.05)',
    paddingBottom: '6px',
  },
  historyAudio: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#0B192C',
  },
  historyMeta: {
    fontSize: '11px',
    color: '#5C6E82',
  },
  backBtn: {
    marginTop: '32px',
    padding: '12px 24px',
    backgroundColor: '#0B192C',
    color: '#FBBF24',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(11, 25, 44, 0.2)',
  },
}

export default AdminPanel