
import Link from 'next/link'

const TABS: { label: string, href: string }[] = [
  { label: 'All centers', href: '/donation_centers' },
  { label: 'Map by zip code', href: '/map_by_zip' },
  { label: 'Search by wish list', href: '/search_by_wishlist' },
]

export default function DonorTabs(props: { current: string }) {
  return (
    <nav style={{ display: 'flex', gap: '12px', margin: '16px 0' }}>
      {TABS.map((tab) => {
        const isCurrent = tab.href === props.current

        const style = {
          padding: '10px 24px',
          border: '2px solid gray',
          borderRadius: '10px',
          textDecoration: 'none',
          color: isCurrent ? 'white' : 'inherit',
          backgroundColor: isCurrent ? '#45b0e0' : 'transparent',
        }

        return (
          <Link key={tab.label} href={tab.href} style={style}>
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
