import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const navigate = useNavigate()
  const userName = localStorage.getItem('userName')
  const userEmail = localStorage.getItem('userEmail')
  const userRole = localStorage.getItem('userRole')
  const displayName = userName || userEmail || 'User'

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navBrand}>FSLAKWS DASHBOARD</div>
        <button
          style={styles.logoutButton}
          onClick={() => {
            localStorage.removeItem('userId')
            localStorage.removeItem('userName')
            localStorage.removeItem('userEmail')
            localStorage.removeItem('userRole')
            navigate('/')
          }}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        <div style={styles.welcomeSection}>
          <h3 style={styles.welcomeText}>Welcome back, {displayName}! 👋</h3>
          <p style={styles.subText}>Ready to run some keyword searches in your audio files?</p>
        </div>

        <div style={styles.cardGrid}>
          <div
            style={styles.card}
            onClick={() => navigate('/keyword-search')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 10px 20px rgba(245, 158, 11, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)'
            }}
          >
            <div style={styles.cardIcon}>🔍</div>
            <h4 style={styles.cardTitle}>Keyword Search</h4>
            <p style={styles.cardDesc}>Enroll keywords and search recordings for matches.</p>
          </div>

          <div
            style={styles.card}
            onClick={() => navigate('/history')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 10px 20px rgba(236, 72, 153, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)'
            }}
          >
            <div style={styles.cardIcon}>📜</div>
            <h4 style={styles.cardTitle}>Search History</h4>
            <p style={styles.cardDesc}>View your previous search logs and timestamp hits.</p>
          </div>

          {userRole === 'ADMIN' && (
            <div
              style={styles.card}
              onClick={() => navigate('/admin')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(168, 85, 247, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)'
              }}
            >
              <div style={styles.cardIcon}>⚙️</div>
              <h4 style={styles.cardTitle}>Admin Panel</h4>
              <p style={styles.cardDesc}>Manage users and monitor system activity logs.</p>
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
  logoutButton: {
    padding: '8px 18px',
    backgroundColor: 'transparent',
    color: '#FF6B6B',
    border: '2px solid #FF6B6B',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  content: {
    padding: '60px 40px',
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
  },
  welcomeSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  welcomeText: {
    margin: 0,
    fontSize: '32px',
    fontWeight: '800',
    color: '#0B192C',
    letterSpacing: '-0.5px',
  },
  subText: {
    margin: 0,
    fontSize: '15px',
    color: '#5C6E82',
    fontWeight: '500',
  },
  cardGrid: {
    display: 'flex',
    gap: '30px',
    flexWrap: 'wrap',
  },
  card: {
    flex: 1,
    minWidth: '280px',
    backgroundColor: '#FFFFFF',
    border: '1px solid rgba(11, 25, 44, 0.08)',
    borderRadius: '20px',
    padding: '40px 32px',
    cursor: 'pointer',
    boxShadow: '0 10px 30px rgba(11, 25, 44, 0.03)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  cardIcon: {
    fontSize: '44px',
    marginBottom: '4px',
  },
  cardTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '800',
    color: '#0B192C',
  },
  cardDesc: {
    margin: 0,
    fontSize: '14px',
    color: '#5C6E82',
    lineHeight: '1.6',
    fontWeight: '500',
  },
}

export default Dashboard