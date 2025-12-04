import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function DELETE() {
  try {
    // Get current user from session
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Nie jesteś zalogowany' },
        { status: 401 }
      )
    }

    const userId = user.id

    // Use admin client to delete user data and account
    const adminClient = createAdminClient()

    // Delete user data from all tables
    await adminClient.from('user_alerts').delete().eq('user_id', userId)
    await adminClient.from('saved_searches').delete().eq('user_id', userId)
    await adminClient.from('profiles').delete().eq('id', userId)

    // Delete the user account using admin API
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      return NextResponse.json(
        { error: 'Nie udało się usunąć konta. Spróbuj ponownie.' },
        { status: 500 }
      )
    }

    // Sign out the user
    await supabase.auth.signOut()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas usuwania konta' },
      { status: 500 }
    )
  }
}
