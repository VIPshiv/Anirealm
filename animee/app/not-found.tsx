import Link from 'next/link'
import { headers } from 'next/headers'
 
export default async function NotFound() {
  const headersList = headers()
  
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-black text-white">
      <h2 className="text-4xl font-bold mb-4">404 - Not Found</h2>
      <p className="text-gray-400 mb-8">Could not find requested resource</p>
      <Link 
        href="/"
        className="px-6 py-3 bg-pink-500 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
      >
        Return Home
      </Link>
    </div>
  )
}
