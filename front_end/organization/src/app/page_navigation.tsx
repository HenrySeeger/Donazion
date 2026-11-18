import styles from "./page.module.css";
import Link from 'next/link'

export default function Nav(props: {current_page: string}) {
  let page = props.current_page
  return (
    <div className={styles.nav_container} style={{zIndex: 1}}>
      <Link href="/" style={{backgroundColor: page == "dashboard" ? "var(--nav-selected)" : "var(--nav-deselected"}}>Dashboard</Link>
      <Link href="/item_categories" style={{backgroundColor: page == "item categories" ? "var(--nav-selected)" : "var(--nav-deselected"}}>Categories & Items</Link>
      <Link href="/donation_centers" style={{backgroundColor: page == "donation centers" ? "var(--nav-selected)" : "var(--nav-deselected"}}>Donation Centers</Link>
      <Link href="/edit_password" style={{backgroundColor: page == "edit password" ? "var(--nav-selected)" : "var(--nav-deselected"}}>Edit Password</Link>
    </div>
)}