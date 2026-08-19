import { useEffect, useRef, useState } from 'react'
import './App.css'

const defaultGallery = [
  { id: 'hero', src: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=85', alt: 'Warm contemporary living room' },
  { id: 'chair', src: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=85', alt: 'Cream lounge sofa' },
  { id: 'dining', src: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1000&q=85', alt: 'Refined dining space' },
  { id: 'detail', src: 'https://images.unsplash.com/photo-1617104678098-de229db51175?auto=format&fit=crop&w=1000&q=85', alt: 'Textured designer chair' },
]

function App() {
  const isAdminRoute = window.location.pathname === '/admin'
  const [logo, setLogo] = useState(() => localStorage.getItem('aos-logo') || '')
  const [gallery, setGallery] = useState(() => JSON.parse(localStorage.getItem('aos-gallery') || 'null') || defaultGallery)
  const logoInput = useRef(null)
  const galleryInput = useRef(null)

  useEffect(() => localStorage.setItem('aos-gallery', JSON.stringify(gallery)), [gallery])
  useEffect(() => { if (logo) localStorage.setItem('aos-logo', logo) }, [logo])

  if (isAdminRoute) return <AdminPage logo={logo} setLogo={setLogo} gallery={gallery} setGallery={setGallery} logoInput={logoInput} galleryInput={galleryInput} />

  return <PublicSite logo={logo} gallery={gallery} />
}

function AdminPage({ logo, setLogo, gallery, setGallery, logoInput, galleryInput }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem('aos-admin-session') === 'true')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const login = (event) => {
    event.preventDefault()
    const validEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@aosfurniture.com'
    const validPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'aosadmin'
    if (email === validEmail && password === validPassword) {
      sessionStorage.setItem('aos-admin-session', 'true')
      setIsLoggedIn(true)
      setError('')
    } else setError('The email or password is incorrect.')
  }

  const logout = () => { sessionStorage.removeItem('aos-admin-session'); setIsLoggedIn(false) }

  const readFiles = (files, kind) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = () => {
        if (kind === 'logo') setLogo(reader.result)
        else setGallery((current) => [...current, { id: `${Date.now()}-${file.name}`, src: reader.result, alt: file.name }])
      }
      reader.readAsDataURL(file)
    })
  }

  if (!isLoggedIn) return (
    <div className="site admin-page">
      <header className="nav"><a className="brand" href="/"><span>AOS</span><small>FURNITURE</small></a><a className="back-link" href="/">Back to website <span>↗</span></a></header>
      <main className="login-panel"><div className="login-copy"><p className="eyebrow">Private workspace</p><h1>Welcome<br /><em>back.</em></h1><p>Sign in to manage the images and brand assets shown on your website.</p></div><form className="login-form" onSubmit={login}><label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required /></label>{error && <p className="form-error">{error}</p>}<button className="login-button" type="submit">Sign in <span>↗</span></button><p className="login-note">Admin credentials are configured with <code>VITE_ADMIN_EMAIL</code> and <code>VITE_ADMIN_PASSWORD</code>.</p></form></main>
      <footer><a className="brand" href="/"><span>AOS</span><small>FURNITURE</small></a><span>© 2026 AOS Furniture</span></footer>
    </div>
  )

  return (
    <div className="site admin-mode">
      <header className="nav">
        <a className="brand" href="/" aria-label="AOS Furniture home">
          {logo ? <img src={logo} alt="AOS Furniture logo" /> : <><span>AOS</span><small>FURNITURE</small></>}
        </a>
        <div className="admin-nav"><span>Signed in as admin</span><button className="admin-button" type="button" onClick={logout}>Log out</button></div>
      </header>
      <main className="admin-panel">
          <div className="admin-intro"><p className="eyebrow">Content studio</p><h1>Make the room yours.</h1><p>Upload your brand mark and the images that tell your story. Changes are saved in this browser and appear across the site instantly.</p></div>
          <div className="upload-grid">
            <section className="upload-card"><div><p className="eyebrow">Brand identity</p><h2>Company logo</h2><p className="muted">PNG, JPG or SVG</p></div><input ref={logoInput} type="file" accept="image/*" onChange={(event) => readFiles(event.target.files, 'logo')} hidden /><button className="upload-button" onClick={() => logoInput.current?.click()}>Upload logo <span>+</span></button>{logo && <img className="logo-preview" src={logo} alt="Uploaded company logo" />}</section>
            <section className="upload-card"><div><p className="eyebrow">Visual library</p><h2>Gallery images</h2><p className="muted">Add as many as you like</p></div><input ref={galleryInput} type="file" accept="image/*" multiple onChange={(event) => readFiles(event.target.files, 'gallery')} hidden /><button className="upload-button" onClick={() => galleryInput.current?.click()}>Add images <span>+</span></button><div className="admin-gallery">{gallery.map((image) => <div className="admin-image" key={image.id}><img src={image.src} alt={image.alt} /><button onClick={() => setGallery((current) => current.filter((item) => item.id !== image.id))} aria-label={`Remove ${image.alt}`}>×</button></div>)}</div></section>
          </div>
      </main>
      <footer><a className="brand" href="/"><span>AOS</span><small>FURNITURE</small></a><p>Content studio</p><span>© 2026 AOS Furniture</span></footer>
    </div>
  )
}

function PublicSite({ logo, gallery }) {
  return (
    <div className="site">
      <header className="nav">
        <a className="brand" href="#top" aria-label="AOS Furniture home">
          {logo ? <img src={logo} alt="AOS Furniture logo" /> : <><span>AOS</span><small>FURNITURE</small></>}
        </a>
        <nav className="links reference-links" aria-label="Main navigation"><a className="active" href="#top">Home</a><a href="#story">About</a><a href="#collection">Services</a><a href="#collection">Gallery</a><a href="#story">Masterclass</a><a href="#collection">Shop</a><a href="#contact">Contact</a></nav>
      </header>
      <main id="top">
          <section className="hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(24, 24, 20, .72), rgba(24, 24, 20, .08)), url(${gallery[0]?.src || defaultGallery[0].src})` }}><div className="hero-copy"><p className="eyebrow light">Furniture for living beautifully</p><h1>Rooms that feel<br /><em>like you.</em></h1><p className="hero-text">Thoughtful pieces, honest materials, and a softer way to live. Designed in small batches for the places you call home.</p><a className="circle-link" href="#collection">Explore collection <span>↘</span></a></div><div className="hero-note">EST. 2012 <i /> DESIGNED FOR SLOW LIVING</div></section>
          <section className="intro-band" id="story"><p className="eyebrow">The AOS approach</p><h2>Furniture with a point of view.<br /><span>Made to become part of your story.</span></h2><p>We believe a well-made room changes the way a day feels. Our collection balances warm tactility with quiet, considered forms that let life take center stage.</p></section>
          <section className="collection" id="collection"><div className="section-heading"><div><p className="eyebrow">The collection</p><h2>Objects of <em>comfort.</em></h2></div><a href="#contact">View all pieces <span>↗</span></a></div><div className="gallery-grid">{gallery.slice(1).map((image, index) => <article className={`gallery-item item-${index + 1}`} key={image.id}><img src={image.src} alt={image.alt} /><div className="image-caption"><span>{['Lounge / 01', 'Dining / 02', 'Accent / 03'][index] || 'Living / 04'}</span><span>↗</span></div></article>)}</div></section>
          <section className="quote"><p>“The best rooms are<br /><em>felt</em> before they are seen.”</p><span>— AOS design notes</span></section>
          <section className="contact" id="contact"><div><p className="eyebrow">Come see us</p><h2>Let's make room<br />for something <em>good.</em></h2></div><div className="contact-detail"><p>Visit our studio for a slower look at the collection, or begin with a conversation about your space.</p><a className="text-link" href="mailto:hello@aosfurniture.com">hello@aosfurniture.com <span>↗</span></a><p className="address">18 Design District<br />Lagos, Nigeria</p></div></section>
      </main>
      <footer><a className="brand" href="#top"><span>AOS</span><small>FURNITURE</small></a><p>Made for the way you live.</p><span>© 2026 AOS Furniture</span></footer>
    </div>
  )
}

export default App
