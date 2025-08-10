import React from 'react'
import { signOut } from 'firebase/auth'
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { Line } from 'react-chartjs-2'
import { format } from 'date-fns'

export default function Dashboard({ user }) {
  const [transactions, setTransactions] = React.useState([])
  const [amount, setAmount] = React.useState('')
  const [type, setType] = React.useState('Expense')
  const [category, setCategory] = React.useState('')
  const [date, setDate] = React.useState(new Date().toISOString().slice(0,10))
  const [desc, setDesc] = React.useState('')

  React.useEffect(()=>{
    const q = query(collection(db, 'users', user.uid, 'transactions'), orderBy('date', 'desc'))
    const unsub = onSnapshot(q, (snap)=>{
      const items = []
      snap.forEach(d=>items.push({ id: d.id, ...d.data() }))
      setTransactions(items)
    })
    return unsub
  }, [user.uid])

  async function addTransaction(e) {
    e && e.preventDefault()
    if (!amount) return
    await addDoc(collection(db, 'users', user.uid, 'transactions'), {
      amount: parseFloat(amount),
      type,
      category,
      date: date,
      desc,
      createdAt: new Date().toISOString()
    })
    setAmount(''); setCategory(''); setDesc('')
  }

  async function remove(id) {
    await deleteDoc(doc(db, 'users', user.uid, 'transactions', id))
  }

  const totalIncome = transactions.filter(t=>t.type==='Income').reduce((s,t)=>s+t.amount,0)
  const totalExpense = transactions.filter(t=>t.type==='Expense').reduce((s,t)=>s+t.amount,0)
  const net = totalIncome - totalExpense

  // monthly aggregation for chart (last 12 months)
  const months = []
  const now = new Date()
  for (let i=11;i>=0;i--) {
    const d = new Date(now.getFullYear(), now.getMonth()-i, 1)
    months.push(format(d, 'yyyy-MM'))
  }
  const monthlyIncome = months.map(m=>{
    return transactions.filter(t=>t.date.startsWith(m) && t.type==='Income').reduce((s,t)=>s+t.amount,0)
  })
  const monthlyExpense = months.map(m=>{
    return transactions.filter(t=>t.date.startsWith(m) && t.type==='Expense').reduce((s,t)=>s+t.amount,0)
  })

  const chartData = {
    labels: months,
    datasets: [
      { label: 'Income', data: monthlyIncome, tension: 0.3 },
      { label: 'Expense', data: monthlyExpense, tension: 0.3 }
    ]
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">SpendTracker</h1>
        <div>
          <span className="mr-4">{user.email}</span>
          <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={()=>signOut(auth)}>Log out</button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">Net Earnings<div className="text-2xl font-bold">${net.toFixed(2)}</div></div>
        <div className="bg-white p-4 rounded shadow">Total Income<div className="text-2xl font-bold">${totalIncome.toFixed(2)}</div></div>
        <div className="bg-white p-4 rounded shadow">Total Expense<div className="text-2xl font-bold">${totalExpense.toFixed(2)}</div></div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-bold mb-3">Add Transaction</h2>
        <form onSubmit={addTransaction} className="grid grid-cols-1 md:grid-cols-6 gap-2">
          <input className="p-2 border rounded" placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} />
          <select className="p-2 border rounded" value={type} onChange={e=>setType(e.target.value)}>
            <option>Expense</option>
            <option>Income</option>
          </select>
          <input className="p-2 border rounded" placeholder="Category" value={category} onChange={e=>setCategory(e.target.value)} />
          <input className="p-2 border rounded" type="date" value={date} onChange={e=>setDate(e.target.value)} />
          <input className="p-2 border rounded" placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} />
          <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Add</button>
        </form>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-bold mb-3">Monthly Trends (last 12 months)</h2>
        <Line data={chartData} />
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-bold mb-3">Recent Transactions</h2>
        <div className="space-y-2">
          {transactions.map(t=> (
            <div key={t.id} className="flex items-center justify-between p-2 border rounded">
              <div>
                <div className="font-bold">{t.category || t.desc || '—'}</div>
                <div className="text-sm text-gray-600">{t.date} — {t.desc}</div>
              </div>
              <div className={`font-bold ${t.type==='Expense'?'text-red-600':'text-green-600'}`}>${t.amount.toFixed(2)}</div>
              <div><button className="text-sm text-red-600" onClick={()=>remove(t.id)}>Delete</button></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
