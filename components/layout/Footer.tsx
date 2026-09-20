import { StatusBadge } from "@/components/ui/StatusBadge";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <a className="brand" href="#hero">
              ZHIDAN<span className="green">.DEV</span>
            </a>
            <p>Designed & built with curiosity, code, and caffeine.</p>
          </div>
          <StatusBadge>HELSINKI // PORTFOLIO SYSTEM</StatusBadge>
        </div>
        <div className="footer-bottom micro">
          <span>© {new Date().getFullYear()} Zhidan. All rights reserved.</span>
          <a href="#hero">[ BACK TO TOP ↑ ]</a>
        </div>
      </div>
    </footer>
  );
}
