import { useEffect, useRef, useState } from 'react'
import './App.css'
import servicesBackground from '../modern-sofa-1024x602.jpg'
import defaultLogo from '../f75Ke-removebg-preview.png'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { supabase } from './supabase'

L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow })

const defaultGallery = [
  { id: 'hero', src: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=85', alt: 'Warm contemporary living room', price: '' },
  { id: 'chair', src: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=85', alt: 'Cream lounge sofa', price: '₦850,000' },
  { id: 'dining', src: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1000&q=85', alt: 'Refined dining space', price: '₦620,000' },
  { id: 'detail', src: 'https://images.unsplash.com/photo-1617104678098-de229db51175?auto=format&fit=crop&w=1000&q=85', alt: 'Textured designer chair', price: '₦280,000' },
]

const whatsappLink = 'https://wa.me/2348144293899'
const instagramLink = 'https://www.instagram.com/aos_furniture__interior/'
const mapsLink = 'https://maps.app.goo.gl/LRwNh4N4PAAEA4Y59?g_st=ac'
const mapsEmbed = 'https://www.google.com/maps?q=184+Ipaja+Rd,+Idimu,+Lagos+102213,+Lagos&output=embed'
const secondMapsLink = 'https://maps.app.goo.gl/M739YETfevVQ22zC6'
const secondMapsEmbed = 'https://www.google.com/maps?q=Imperial+De-Vine+Dews+School,+65+Agbado+New+Rd,+Ifako-Ijaiye,+Lagos+112105&output=embed'
const combinedMapsLink = 'https://www.google.com/maps/dir/?api=1&origin=184+Ipaja+Rd,+Idimu,+Lagos+102213,+Lagos&destination=Imperial+De-Vine+Dews+School,+65+Agbado+New+Rd,+Ifako-Ijaiye,+Lagos+112105'
const combinedMapsEmbed = mapsEmbed
const defaultServices = [
  { id: 'hotel', name: 'Hotel Furniture', eyebrow: '01 / Hospitality', copy: 'Thoughtful, durable pieces for guest rooms, lobbies, lounges, and dining spaces. We help hospitality teams create memorable environments that feel considered from the first arrival.' },
  { id: 'home', name: 'Home Furniture', eyebrow: '02 / Residential', copy: 'From a single statement piece to a complete home, we create warm, comfortable furniture that reflects your lifestyle and makes everyday living feel more intentional.' },
  { id: 'office', name: 'Office Furniture', eyebrow: '03 / Workspace', copy: 'Create a workspace that supports focus, collaboration, and wellbeing. Our office solutions combine practical performance with the character and comfort your team deserves.' },
  { id: 'interior', name: 'Full Interior', eyebrow: '04 / Complete spaces', copy: 'Bring every part of your space together with a complete interior service. We coordinate the furniture, finishes, styling, and details to turn your vision into one beautifully finished environment.' },
  { id: 'kitchen', name: 'Kitchen Furniture', eyebrow: '05 / Kitchen', copy: 'Beautiful, functional kitchen pieces made around the way you cook, gather, and live. We create solutions that make the heart of your home feel as good as it works.' },
]

const readStoredJson = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') || fallback
  } catch {
    return fallback
  }
}

const createImageId = (fileName) => `${Date.now()}-${Math.random().toString(36).slice(2)}-${fileName}`
const createServiceId = () => `service-${Date.now()}-${Math.random().toString(36).slice(2)}`

function App() {
  const isAdminRoute = window.location.pathname === '/admin'
  const isGalleryRoute = window.location.pathname === '/gallery'
  const [logo, setLogo] = useState(() => localStorage.getItem('aos-logo') || '')
  const [gallery, setGallery] = useState(() => readStoredJson('aos-gallery', defaultGallery))
  const [products, setProducts] = useState(() => readStoredJson('aos-products', readStoredJson('aos-gallery', defaultGallery).slice(1)))
  const [services, setServices] = useState(() => readStoredJson('aos-services', defaultServices))
  const [contentLoaded, setContentLoaded] = useState(false)
  const logoInput = useRef(null)
  const visualGalleryInput = useRef(null)
  const galleryInput = useRef(null)

  useEffect(() => localStorage.setItem('aos-gallery', JSON.stringify(gallery)), [gallery])
  useEffect(() => localStorage.setItem('aos-products', JSON.stringify(products)), [products])
  useEffect(() => { if (logo) localStorage.setItem('aos-logo', logo) }, [logo])
  useEffect(() => localStorage.setItem('aos-services', JSON.stringify(services)), [services])
  useEffect(() => {
    let active = true
    const loadContent = async () => {
      if (!supabase) {
        if (active) setContentLoaded(true)
        return
      }
      const { data, error } = await supabase.from('site_content').select('logo, gallery, products, services').eq('id', 1).maybeSingle()
      if (error) console.error('Could not load shared site content:', error)
      if (active && data) {
        setLogo(data.logo || '')
        setGallery(data.gallery || defaultGallery)
        setProducts(data.products || defaultGallery.slice(1))
        setServices(data.services || defaultServices)
      }
      if (active) setContentLoaded(true)
    }
    loadContent()
    return () => { active = false }
  }, [])
  useEffect(() => {
    if (!contentLoaded) return undefined
    if (!supabase) return undefined
    const saveContent = async () => {
      const { error } = await supabase.from('site_content').upsert({ id: 1, logo, gallery, products, services, updated_at: new Date().toISOString() })
      if (error) console.error('Could not save shared site content:', error)
    }
    const timeout = window.setTimeout(saveContent, 300)
    return () => window.clearTimeout(timeout)
  }, [contentLoaded, logo, gallery, products, services])

  if (isAdminRoute) return <AdminPage logo={logo} setLogo={setLogo} gallery={gallery} setGallery={setGallery} products={products} setProducts={setProducts} services={services} setServices={setServices} logoInput={logoInput} visualGalleryInput={visualGalleryInput} galleryInput={galleryInput} />
  if (isGalleryRoute) return <GalleryPage logo={logo} gallery={gallery} />

  return <PublicSite logo={logo} gallery={gallery} products={products} services={services} />
}

function AdminPage({ logo, setLogo, gallery, setGallery, products, setProducts, services, setServices, logoInput, visualGalleryInput, galleryInput }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem('aos-admin-session') === 'true')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [uploadError, setUploadError] = useState('')

  const login = (event) => {
    event.preventDefault()
    const validEmail = import.meta.env.VITE_ADMIN_EMAIL
    const validPassword = import.meta.env.VITE_ADMIN_PASSWORD
    if (!validEmail || !validPassword) {
      setError('Admin login is not configured for this deployment.')
      return
    }
    if (email === validEmail && password === validPassword) {
      sessionStorage.setItem('aos-admin-session', 'true')
      setIsLoggedIn(true)
      setError('')
    } else setError('The email or password is incorrect.')
  }

  const logout = () => { sessionStorage.removeItem('aos-admin-session'); setIsLoggedIn(false) }
  const saveAndViewSite = () => {
    if (logo) localStorage.setItem('aos-logo', logo)
    localStorage.setItem('aos-gallery', JSON.stringify(gallery))
    localStorage.setItem('aos-products', JSON.stringify(products))
    window.location.href = '/'
  }

  const readFiles = async (files, kind) => {
    setUploadError('')
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      const imageId = createImageId(file.name)
      if (!supabase) {
        const reader = new FileReader()
        reader.onload = () => {
          if (kind === 'logo') setLogo(reader.result)
          else if (kind === 'product') setProducts((current) => [...current, { id: imageId, src: reader.result, alt: file.name, price: '' }])
          else setGallery((current) => [...current, { id: imageId, src: reader.result, alt: file.name, price: '' }])
        }
        reader.readAsDataURL(file)
        continue
      }
      const path = `${kind}/${imageId}`
      const { error } = await supabase.storage.from('aos-media').upload(path, file, { contentType: file.type, upsert: false })
      if (error) {
        console.error('Could not upload image:', error)
        setUploadError(`Upload failed: ${error.message}. Check that the aos-media bucket is public and that the Supabase storage policies have been run.`)
        continue
      }
      const { data } = supabase.storage.from('aos-media').getPublicUrl(path)
      if (kind === 'logo') setLogo(data.publicUrl)
      else if (kind === 'product') setProducts((current) => [...current, { id: imageId, src: data.publicUrl, alt: file.name, price: '' }])
      else setGallery((current) => [...current, { id: imageId, src: data.publicUrl, alt: file.name, price: '' }])
    }
  }

  if (!isLoggedIn) return (
    <div className="site admin-page">
      <header className="nav"><a className="brand" href="/"><img src={defaultLogo} alt="AOS Furniture logo" /></a><a className="back-link" href="/">Back to website <span>↗</span></a></header>
      <main className="login-panel"><div className="login-copy"><p className="eyebrow">Private workspace</p><h1>Welcome<br /><em>back.</em></h1><p>Sign in to manage the images and brand assets shown on your website.</p></div><form className="login-form" onSubmit={login}><label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required /></label>{error && <p className="form-error">{error}</p>}<button className="login-button" type="submit">Sign in <span>↗</span></button><p className="login-note">Admin credentials are configured with <code>VITE_ADMIN_EMAIL</code> and <code>VITE_ADMIN_PASSWORD</code>.</p></form></main>
      <footer><span>© 2026 AOS Furniture</span></footer>
    </div>
  )

  return (
    <div className="site admin-mode">
      <header className="nav">
        <a className="brand" href="/" aria-label="AOS Furniture home">
          <img src={logo || defaultLogo} alt="AOS Furniture logo" />
        </a>
        <div className="admin-nav"><a className="admin-site-link" href="/#shop">View shop</a><span>Signed in as admin</span><button className="admin-button" type="button" onClick={logout}>Log out</button></div>
      </header>
      <div className="admin-toolbar"><span>Admin content studio</span><button className="save-site-button" type="button" onClick={saveAndViewSite}>Save &amp; view site <span>↗</span></button></div>
      <main className="admin-panel">
          <div className="admin-intro"><p className="eyebrow">Content studio</p><h1>Make the room yours.</h1><p>Upload your brand mark and the images that tell your story. Save when you are ready to publish them on the website.</p>{uploadError && <p className="form-error upload-error">{uploadError}</p>}</div>
          <div className="upload-grid">
            <section className="upload-card"><div><p className="eyebrow">Brand identity</p><h2>Company logo</h2><p className="muted">PNG, JPG or SVG</p></div><input ref={logoInput} type="file" accept="image/*" onChange={(event) => readFiles(event.target.files, 'logo')} hidden /><button className="upload-button" onClick={() => logoInput.current?.click()}>Upload logo <span>+</span></button>{logo && <img className="logo-preview" src={logo} alt="Uploaded company logo" />}</section>
            <section className="upload-card"><div><p className="eyebrow">Visual library</p><h2>Gallery images</h2><p className="muted">Add images for the visual gallery only. These will not appear in the shop.</p></div><input ref={visualGalleryInput} type="file" accept="image/*" multiple onChange={(event) => { readFiles(event.target.files, 'gallery'); event.target.value = '' }} hidden /><button className="upload-button" type="button" onClick={() => visualGalleryInput.current?.click()}>Add gallery images <span>+</span></button><div className="admin-gallery">{gallery.map((image) => <div className="admin-image" key={image.id}><img src={image.src} alt={image.alt} /><button onClick={() => setGallery((current) => current.filter((item) => item.id !== image.id))} aria-label={`Remove ${image.alt}`}>×</button></div>)}</div></section>
            <section className="upload-card pricing-card"><div><p className="eyebrow">Shop settings</p><h2>Products &amp; prices</h2><p className="muted">Upload shop products separately. Rename each item and add a price to show each one on the home page shop section.</p></div><input ref={galleryInput} type="file" accept="image/*" multiple onChange={(event) => { readFiles(event.target.files, 'product'); event.target.value = '' }} hidden /><button className="upload-button" type="button" onClick={() => galleryInput.current?.click()}>Upload product photos <span>+</span></button><div className="price-editor-grid">{products.map((image) => <div className="price-editor" key={`price-${image.id}`}><img src={image.src} alt={image.alt} /><input className="product-name-input" aria-label={`Name for ${image.alt}`} value={image.alt || ''} onChange={(event) => setProducts((current) => current.map((item) => item.id === image.id ? { ...item, alt: event.target.value } : item))} placeholder="Product name" /><input aria-label={`Price for ${image.alt}`} value={image.price || ''} onChange={(event) => setProducts((current) => current.map((item) => item.id === image.id ? { ...item, price: event.target.value } : item))} placeholder="e.g. ₦450,000" /><button className="delete-item-button" type="button" onClick={() => setProducts((current) => current.filter((item) => item.id !== image.id))}>Delete product</button></div>)}</div></section>
            <section className="upload-card services-editor"><div><p className="eyebrow">Services page</p><h2>Service names</h2><p className="muted">Edit existing services or add more for the Services page. Each one includes a Book now button to WhatsApp.</p></div><div className="service-name-grid">{services.map((service) => <div className="service-name-field" key={service.id}><span>{service.eyebrow}</span><input aria-label={`Name for ${service.eyebrow}`} value={service.name} onChange={(event) => setServices((current) => current.map((item) => item.id === service.id ? { ...item, name: event.target.value } : item))} /><button className="delete-item-button" type="button" onClick={() => setServices((current) => current.filter((item) => item.id !== service.id))}>Delete service</button></div>)}</div><button className="upload-button service-add-button" type="button" onClick={() => setServices((current) => [...current, { id: createServiceId(), name: 'New service', eyebrow: `${String(current.length + 1).padStart(2, '0')} / New service`, copy: '' }])}>Add another service <span>+</span></button></section>
          </div>
      </main>
      <footer><p>Content studio</p><span>© 2026 AOS Furniture</span></footer>
    </div>
  )
}

function ServiceBooking({ service }) {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  const submitBooking = (event) => {
    event.preventDefault()
    const message = `Hello AOS Furniture, I would like to book ${service.name}.%0A%0AFull name: ${name}%0ADate: ${date}%0ATime: ${time}`
    window.open(`${whatsappLink}?text=${message}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <form className="service-booking" onSubmit={submitBooking}>
      <input aria-label={`Full name for ${service.name}`} type="text" placeholder="Full Name" value={name} onChange={(event) => setName(event.target.value)} required />
      <div className="booking-row"><label><span>Date</span><input aria-label={`Date for ${service.name}`} type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label><label><span>Time</span><input aria-label={`Time for ${service.name}`} type="time" value={time} onChange={(event) => setTime(event.target.value)} required /></label></div>
      <button type="submit">Book on WhatsApp <span>↗</span></button>
    </form>
  )
}

function GalleryPage({ logo, gallery }) {
  return (
    <div className="site gallery-page">
      <header className="nav"><a className="brand" href="/"><img src={logo || defaultLogo} alt="AOS Furniture logo" /></a><a className="back-link" href="/">Back to website <span>↗</span></a></header>
      <main>
        <section className="gallery-section" id="gallery"><div className="section-heading"><div><p className="eyebrow">The gallery</p><h1>Spaces with <em>soul.</em></h1></div><p className="shop-note">A closer look at the details, textures,<br />and rooms behind the AOS collection.</p></div><div className="gallery-wall">{gallery.map((image, index) => <figure className={`gallery-wall-item gallery-wall-${index + 1}`} key={`gallery-page-${image.id}`}><img src={image.src} alt={image.alt} /><figcaption>{String(index + 1).padStart(2, '0')} / AOS FURNITURE</figcaption></figure>)}</div></section>
      </main>
      <footer><span>© 2026 AOS Furniture</span></footer>
    </div>
  )
}

function LocationMap() {
  return <MapContainer className="leaflet-map" center={[6.65, 3.3]} zoom={11} scrollWheelZoom={false}>
    <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <Marker position={[6.615, 3.296]}><Popup><strong>Head Office</strong><br />184 Ipaja Rd, Idimu, Lagos<br /><a href={mapsLink} target="_blank" rel="noreferrer">Open exact pin</a></Popup></Marker>
    <Marker position={[6.6827326, 3.2995484]}><Popup><strong>Branch</strong><br />65 Agbado New Rd, Ifako-Ijaiye<br /><a href={secondMapsLink} target="_blank" rel="noreferrer">Open exact pin</a></Popup></Marker>
  </MapContainer>
}

function PublicSite({ logo, gallery, products, services }) {
  const [showServices, setShowServices] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const shopTrackRef = useRef(null)
  const changeShopDirection = (direction) => {
    const animation = shopTrackRef.current?.getAnimations()[0]
    if (!animation) return
    animation.playbackRate = direction === 'backward' ? -1 : 1
    animation.play()
  }

  return (
    <div className="site">
      <header className="nav">
        <a className="brand" href="#top" aria-label="AOS Furniture home">
          <img src={logo || defaultLogo} alt="AOS Furniture logo" />
        </a>
        <button className="menu-toggle" type="button" aria-label="Toggle navigation menu" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((current) => !current)}><span /><span /><span /></button>
        <nav className={mobileMenuOpen ? 'links reference-links mobile-open' : 'links reference-links'} aria-label="Main navigation"><a className="active" href="#top" onClick={() => setMobileMenuOpen(false)}>Home</a><a href="#gallery" onClick={() => setMobileMenuOpen(false)}>Gallery</a><a href="#services" onClick={() => setMobileMenuOpen(false)}>Services</a><a href="#shop" onClick={() => setMobileMenuOpen(false)}>Shop</a><a href="#story" onClick={() => setMobileMenuOpen(false)}>About</a><a href={whatsappLink} target="_blank" rel="noreferrer" onClick={() => setMobileMenuOpen(false)}>Contact</a></nav>
      </header>
      <main id="top">
          <section className="hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(24, 24, 20, .72), rgba(24, 24, 20, .08)), url(${gallery[0]?.src || defaultGallery[0].src})` }}><div className="hero-copy"><p className="eyebrow light">Furniture for living beautifully</p><h1>Rooms that feel<br /><em>like you.</em></h1><p className="hero-text">Thoughtful pieces, honest materials, and a softer way to live. Designed in small batches for the places you call home.</p><a className="circle-link" href="#collection">Explore collection <span>↘</span></a></div><div className="hero-note">SINCE 1989 <i /> MADE FOR EVERYDAY LIVING</div></section>
          <section className="gallery-section" id="gallery"><div className="section-heading"><div><p className="eyebrow">The gallery</p><h2>Spaces with <em>soul.</em></h2></div><p className="shop-note">A closer look at the details, textures,<br />and rooms behind the AOS collection.</p></div><div className="gallery-wall">{gallery.slice(0, 4).map((image, index) => <figure className={`gallery-wall-item gallery-wall-${index + 1}`} key={`gallery-${image.id}`}><img src={image.src} alt={image.alt} /><figcaption>{String(index + 1).padStart(2, '0')} / AOS FURNITURE</figcaption></figure>)}</div><a className="gallery-more-link" href="/gallery">View more <span>↗</span></a></section>
          <section className={`services-intro${showServices ? ' services-expanded' : ''}`} id="services" style={{ backgroundImage: `linear-gradient(90deg, rgba(24, 24, 20, .94), rgba(24, 24, 20, .68)), url(${servicesBackground})` }}><div><p className="eyebrow">Our services</p><h2>Complete living<br /><em>experiences.</em></h2></div><div className="services-copy"><p>At <strong>AOS Furniture</strong>, we don’t just sell furniture — we create complete living experiences. From the moment you share your vision to the day your new pieces are perfectly placed in your home, our dedicated team is with you every step of the way.</p><p>Whether you’re furnishing a single room, outfitting an entire home, or looking for custom solutions tailored to your space and lifestyle, we offer thoughtful design guidance, seamless delivery, professional assembly, and ongoing support. Every service is designed to make your journey effortless, enjoyable, and truly rewarding.</p><p>Discover how AOS Furniture turns inspiration into beautifully finished spaces.</p><button className="services-toggle" type="button" onClick={() => setShowServices((current) => !current)} aria-expanded={showServices}>{showServices ? 'Show less' : 'View more'} <span>{showServices ? '↖' : '↘'}</span></button></div>{showServices && <div className="services-detail">{services.map((service) => <article key={service.id}><p className="eyebrow">{service.eyebrow}</p><h3>{service.name}</h3><p>{service.copy}</p><ServiceBooking service={service} /></article>)}</div>}</section>
          <section className="collection" id="collection"><div className="section-heading"><div><p className="eyebrow">The collection</p><h2>Objects of <em>comfort.</em></h2></div><a href="#shop">View all pieces <span>↗</span></a></div><div className="gallery-grid">{gallery.slice(-3).map((image, index) => <article className={`gallery-item item-${index + 1}`} key={image.id}><img src={image.src} alt={image.alt} /><div className="image-caption"><span>{['Lounge / 01', 'Dining / 02', 'Accent / 03'][index] || 'Living / 04'}</span><span>↗</span></div></article>)}</div></section>
          <section className="shop-section" id="shop"><div className="section-heading"><div><p className="eyebrow">Shop the collection</p><h2>Pieces to <em>keep.</em></h2></div><p className="shop-note">Every piece is available by request.<br />Message us on WhatsApp to order.</p></div><button className="shop-side-control shop-side-back" type="button" aria-label="Show previous shop picture" onClick={() => changeShopDirection('backward')}>‹</button><button className="shop-side-control shop-side-forward" type="button" aria-label="Show next shop picture" onClick={() => changeShopDirection('forward')}>›</button><div className="shop-track" ref={shopTrackRef}>{[...products, ...products].map((image, index) => <article className="shop-card" key={`shop-${image.id}-${index}`}><div className="shop-image"><img src={image.src} alt={image.alt} />{image.price && <span className="price-tag">{image.price}</span>}</div><div className="shop-card-info"><span>{image.alt}</span><a className="order-button" href={`${whatsappLink}?text=${encodeURIComponent(`Hello AOS Furniture, I would like to order the ${image.alt}.`)}`} target="_blank" rel="noreferrer">Order Now <span>↗</span></a></div></article>)}</div></section>
          <section className="intro-band" id="story"><p className="eyebrow">Our story · Since 1989</p><div className="about-left"><div className="founder-profile"><img src="/founder.jpg" alt="Ayinde Adebowale Olusanjo, Founder of AOS Furniture and Interior" /><div><h3>Ayinde Adebowale Olusanjo</h3><p>Founder of AOS Furniture and Interior</p></div></div><h2>Built with purpose.<br /><span>Grown through generations.</span></h2></div><div className="story-copy"><p>AOS Furniture began in 1989 in Folarin Alimosho Lagos, with a simple belief: that furniture should be made with care, built to last, and created to bring people closer to the spaces they call home.</p><p>In those early years, the company was led by <strong>Ayinde Samson Olusanjo</strong>, whose discipline, craftsmanship, and commitment to honest work shaped the foundation of AOS Furniture. From that first address, the business grew steadily through the trust of its customers and the quality of every piece it delivered.</p><p>As the vision expanded, AOS Furniture moved to its permanent site on Ipaja Road, creating a lasting home for the company and a place where clients could experience our work more closely. That journey, which started in 1989, continues to this day.</p><p>Today, AOS Furniture is headed by <strong>Mayowa Philips Olusanjo</strong>, carrying the family’s values forward while bringing a fresh perspective to contemporary living. The story continues through thoughtful design, enduring materials, and spaces made for real life.</p></div><div className="general-manager-profile"><img src="/general-manager.jpg" alt="Mayowa Philips Olusanjo, General Manager of AOS Furniture and Interior" /><div><h3>Mayowa Philips Olusanjo</h3><p>General Manager of AOS Furniture and Interior</p></div></div></section>
          <section className="quote"><p>“The best rooms are<br /><em>felt</em> before they are seen.”</p><span>— AOS design notes</span></section>
          <section className="contact" id="contact"><div><p className="eyebrow">Let's talk</p><h2>Make room<br />for something <em>good.</em></h2></div><div className="contact-detail"><p>Have a question or want to start a project? Send us a message on WhatsApp and let’s talk about your space.</p><div className="contact-links"><a className="text-link" href={whatsappLink} target="_blank" rel="noreferrer">Chat with us on WhatsApp <span>↗</span></a><a className="instagram-link" href={instagramLink} target="_blank" rel="noreferrer" aria-label="Follow AOS Furniture on Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" /></svg><span>Instagram</span><b>↗</b></a></div></div><div className="location-grid"><article className="location-card"><p className="eyebrow">Head Office</p><div className="address"><p>184 Ipaja Rd<br />Idimu, Lagos 102213<br />Lagos, Nigeria</p><a className="map-link" href={mapsLink} target="_blank" rel="noreferrer">Open pin 01 <span>↗</span></a></div></article><article className="location-card"><p className="eyebrow">Branch</p><div className="address"><p>Imperial De-Vine Dews School<br />65 Agbado New Rd, Ifako-Ijaiye<br />Lagos 112105, Nigeria</p><a className="map-link" href={secondMapsLink} target="_blank" rel="noreferrer">Open pin 02 <span>↗</span></a></div></article><div className="map-frame combined-map"><LocationMap /><a className="combined-map-link" href={combinedMapsLink} target="_blank" rel="noreferrer">Open both locations in Google Maps <span>↗</span></a></div></div></section>
      </main>
      <footer><p>Made for the way you live.</p><span>© 2026 AOS Furniture · Since 1989</span></footer>
    </div>
  )
}

export default App
