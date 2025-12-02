import { redirect } from 'next/navigation'

// Redirect search page to bills page with search functionality
export default function SearchPage() {
  redirect('/bills')
}
