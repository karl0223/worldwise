import styles from './Sidebar.module.css'
import Logo from './Logo'
import AppNav from './AppNav'
import Footer from './Footer'

function Sidebar() {
    return (
        <div className={styles.sidebar}>
            <Logo />
            <AppNav />

            <p>List of Cities</p>
            <Footer footer={styles.footer} copyright={styles.copyright}/>
        </div>
    )
}

export default Sidebar