import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

function App() {
  const [products, setProducts] = useState([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetchProducts()

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [])

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*')
    setProducts(data || [])
  }

  async function signUp() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) setMessage(error.message)
    else setMessage('Signup successful! Now click Login.')
  }

  async function login() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) setMessage(error.message)
    else {
      setMessage('Logged in!')
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
    setMessage('Logged out')
  }

  async function addProduct(e) {
    e.preventDefault()

    const { error } = await supabase.from('products').insert([
      {
        name,
        description,
        price: Number(price),
        category: 'General',
        image_url: '',
        stock_quantity: 5,
      },
    ])

    if (error) setMessage(error.message)
    else {
      setMessage('Product added successfully!')
      setName('')
      setPrice('')
      setDescription('')
      fetchProducts()
    }
  }

  async function deleteProduct(id) {
    const { error } = await supabase.from('products').delete().eq('id', id)

    if (error) setMessage(error.message)
    else {
      setMessage('Product deleted successfully!')
      fetchProducts()
    }
  }

  return (
    <div className="container">
      <h1>Product Store</h1>

      <p>{message}</p>

      {!user ? (
        <div>
          <input
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            placeholder="Password"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={signUp}>Sign Up</button>
          <button onClick={login}>Login</button>
        </div>
      ) : (
        <div>
          <p>Logged in as {user.email}</p>
          <button onClick={logout}>Logout</button>
        </div>
      )}

      {user && (
        <form onSubmit={addProduct} className="form">
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          <input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <button type="submit">Add Product</button>
        </form>
      )}

      <div className="products">
        {products.map((product) => (
          <div className="card" key={product.id}>
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <p>${product.price}</p>

            {user && (
              <button onClick={() => deleteProduct(product.id)}>
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App