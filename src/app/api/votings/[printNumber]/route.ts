import { NextRequest, NextResponse } from 'next/server'

const SEJM_API_BASE = 'https://api.sejm.gov.pl'

interface SejmVotingBasic {
  votingNumber: number
  sitting: number
  date: string
  title: string
  topic?: string
  yes: number
  no: number
  abstain: number
  notParticipating: number
  totalVoted: number
}

interface SejmVotingDetail {
  votingNumber: number
  sitting: number
  date: string
  title: string
  topic?: string
  yes: number
  no: number
  abstain: number
  notParticipating: number
  votes: Array<{
    MP: number
    club: string
    firstName: string
    lastName: string
    vote: 'YES' | 'NO' | 'ABSTAIN' | 'ABSENT' | 'VOTE_VALID'
  }>
}

interface ClubVotingStats {
  club: string
  total: number
  voted: number
  yes: number
  no: number
  abstain: number
  absent: number
}

export interface VotingWithClubs {
  votingNumber: number
  sitting: number
  date: string
  title: string
  topic?: string
  totals: {
    yes: number
    no: number
    abstain: number
    notParticipating: number
  }
  clubs: ClubVotingStats[]
}

// Fetch all votings for a specific sitting
async function fetchSittingVotings(term: number, sitting: number): Promise<SejmVotingBasic[]> {
  try {
    const response = await fetch(`${SEJM_API_BASE}/sejm/term${term}/votings/${sitting}`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })
    if (!response.ok) return []
    return await response.json()
  } catch {
    return []
  }
}

// Fetch detailed voting with individual votes
async function fetchVotingDetail(term: number, sitting: number, votingNumber: number): Promise<SejmVotingDetail | null> {
  try {
    const response = await fetch(
      `${SEJM_API_BASE}/sejm/term${term}/votings/${sitting}/${votingNumber}`,
      { next: { revalidate: 300 } }
    )
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

// Aggregate votes by club
function aggregateByClub(votes: SejmVotingDetail['votes']): ClubVotingStats[] {
  const clubMap = new Map<string, ClubVotingStats>()

  for (const vote of votes) {
    const club = vote.club || 'niez.'
    
    if (!clubMap.has(club)) {
      clubMap.set(club, {
        club,
        total: 0,
        voted: 0,
        yes: 0,
        no: 0,
        abstain: 0,
        absent: 0,
      })
    }

    const stats = clubMap.get(club)!
    stats.total++

    switch (vote.vote) {
      case 'YES':
        stats.yes++
        stats.voted++
        break
      case 'NO':
        stats.no++
        stats.voted++
        break
      case 'ABSTAIN':
        stats.abstain++
        stats.voted++
        break
      case 'ABSENT':
        stats.absent++
        break
      case 'VOTE_VALID':
        stats.voted++
        break
    }
  }

  // Sort by total members descending
  return Array.from(clubMap.values()).sort((a, b) => b.total - a.total)
}

// Fetch all sittings list to search through
async function fetchAllSittings(term: number): Promise<Array<{ date: string; proceeding: number; votingsNum: number }>> {
  try {
    const response = await fetch(`${SEJM_API_BASE}/sejm/term${term}/votings`, {
      next: { revalidate: 3600 },
    })
    if (!response.ok) return []
    return await response.json()
  } catch {
    return []
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ printNumber: string }> }
) {
  try {
    let { printNumber } = await params
    const term = 10
    
    // Handle format like "10-2038" - extract just the print number
    if (printNumber.includes('-')) {
      printNumber = printNumber.split('-').pop() || printNumber
    }

    // Patterns to match print number in voting title/topic
    // Examples: "druk 1996", "druku nr 1996", "drukach nr 1996", "druków nr 1996 i 2024", "z druku nr 2024"
    const printPatterns = [
      // Match "druk 123" or "druku 123" etc.
      new RegExp(`druk(?:u|ach|ów|i|em)?\\s+(?:nr\\.?\\s*)?${printNumber}(?:\\D|$)`, 'i'),
      // Match "z druku nr 123"
      new RegExp(`z\\s+druku\\s+(?:nr\\.?\\s*)?${printNumber}(?:\\D|$)`, 'i'),
      // Match "nr 123" when context is about prints
      new RegExp(`(?:sprawozdani[ae]|projekt).*(?:nr\\.?|numer)\\s*${printNumber}(?:\\D|$)`, 'i'),
      // Match "drukow nr 123 i 456" pattern
      new RegExp(`druk(?:u|ach|ów|i|em)?\\s+(?:nr\\.?\\s*)?\\d+\\s+i\\s+${printNumber}(?:\\D|$)`, 'i'),
    ]

    // Get all sittings
    const sittings = await fetchAllSittings(term)
    if (sittings.length === 0) {
      return NextResponse.json({ votings: [] })
    }

    const matchedVotings: VotingWithClubs[] = []

    // Search through recent sittings (last 20 for performance)
    const recentSittings = [...new Set(sittings.map(s => s.proceeding))].slice(-30)

    for (const sitting of recentSittings) {
      const votings = await fetchSittingVotings(term, sitting)
      
      for (const voting of votings) {
        const textToSearch = `${voting.title || ''} ${voting.topic || ''}`
        
        // Check if this voting is about our print number
        const matches = printPatterns.some(pattern => pattern.test(textToSearch))
        
        if (matches) {
          // Fetch detailed voting data
          const detail = await fetchVotingDetail(term, sitting, voting.votingNumber)
          
          if (detail && detail.votes) {
            const clubs = aggregateByClub(detail.votes)
            
            matchedVotings.push({
              votingNumber: voting.votingNumber,
              sitting: voting.sitting,
              date: voting.date,
              title: voting.title,
              topic: voting.topic,
              totals: {
                yes: voting.yes,
                no: voting.no,
                abstain: voting.abstain,
                notParticipating: voting.notParticipating,
              },
              clubs,
            })
          }
        }
      }
    }

    // Sort by date descending
    matchedVotings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({ votings: matchedVotings })
  } catch (error) {
    console.error('Error fetching votings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch votings' },
      { status: 500 }
    )
  }
}
