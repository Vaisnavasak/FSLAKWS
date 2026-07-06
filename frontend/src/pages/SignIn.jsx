import axios from 'axios'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState('USER')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignIn = async (e) => {
    e.preventDefault()
    if (email === '' || password === '') {
      alert('Please fill in all fields!')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email: email,
        password: password
      })

      const userRole = response.data.role || 'USER'
      if (selectedRole === 'ADMIN' && userRole !== 'ADMIN') {
        alert('Access Denied: This account does not have administrative privileges!')
        setLoading(false)
        return
      }

      localStorage.setItem('userId', response.data.userId)
      localStorage.setItem('userName', response.data.name)
      localStorage.setItem('userEmail', response.data.email)
      localStorage.setItem('userRole', userRole)

      if (userRole === 'ADMIN') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      if (error.response && error.response.data) {
        alert(error.response.data.message)
      } else {
        alert('Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.headerText}>FSLAKWS LOGIN</h2>
          <p style={styles.subText}>Few-Shot Language-Agnostic Keyword Search</p>
        </div>

        <form onSubmit={handleSignIn} style={styles.body}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Sign In As</label>
            <select
              style={styles.selectInput}
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="USER">👤 Standard User</option>
              <option value="ADMIN">⚙️ Administrator</option>
            </select>
          </div>

          <button type="submit" disabled={loading} style={styles.signInButton}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <div style={styles.divider} />

          <p style={styles.newUserText}>New to FSLAKWS?</p>
          <button
            type="button"
            style={styles.createButton}
            onClick={() => navigate('/register')}
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#FCFBF4',
    fontFamily: "'Outfit', sans-serif",
  },
  card: {
    width: '380px',
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 20px 50px rgba(11, 25, 44, 0.06)',
    border: '1px solid rgba(11, 25, 44, 0.08)',
  },
  header: {
    backgroundColor: '#0B192C',
    padding: '32px 24px',
    textAlign: 'center',
  },
  headerText: {
    margin: '0 0 8px 0',
    fontSize: '24px',
    fontWeight: '900',
    color: '#FBBF24',
    letterSpacing: '1.5px',
  },
  subText: {
    margin: 0,
    fontSize: '12px',
    color: '#8A99AD',
    fontWeight: '500',
    lineHeight: '1.4',
  },
  body: {
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '24px',
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
    letterSpacing: '0.3px',
  },
  input: {
    padding: '12px 16px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #D2D6DC',
    borderRadius: '10px',
    color: '#0B192C',
    fontSize: '14px',
    outline: 'none',
    fontWeight: '500',
    transition: 'border-color 0.2s',
  },
  selectInput: {
    padding: '12px 16px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #D2D6DC',
    borderRadius: '10px',
    color: '#0B192C',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'border-color 0.2s',
  },
  signInButton: {
    padding: '14px',
    background: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
    color: '#0B192C',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(245, 158, 11, 0.2)',
    transition: 'transform 0.2s',
  },
  divider: {
    height: '1px',
    backgroundColor: '#E2E8F0',
  },
  newUserText: {
    margin: '0 0 4px 0',
    fontSize: '13px',
    color: '#718096',
    textAlign: 'center',
    fontWeight: '600',
  },
  createButton: {
    padding: '12px',
    backgroundColor: 'transparent',
    color: '#0B192C',
    border: '2px solid #0B192C',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
}

export default SignIn