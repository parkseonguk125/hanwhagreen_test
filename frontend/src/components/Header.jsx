import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "./Icons";
import { assets, navGroups, topLinks } from "../data/mock";
import { logoutMember } from "../services/authApi";
import { clearAuth, getStoredMember, isLoggedIn } from "../services/authAccess";
import { parseAppHref } from "../utils/navRoutes";
import { preloadBannerForHref } from "../utils/preloadImage";

function AppNavLink({ item, className, onNavigate, onAfterNavigate }) {
  const navigate = useNavigate();
  const target = parseAppHref(item.href);

  if (target) {
    const href = `${target.pathname}${target.search}`;

    return (
      <a
        href={href}
        className={className}
        onMouseEnter={() => preloadBannerForHref(href)}
        onFocus={() => preloadBannerForHref(href)}
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          navigate(target);
          onNavigate?.();
          onAfterNavigate?.();
        }}
      >
        {item.label}
      </a>
    );
  }

  return (
    <a
      href={item.href || "#"}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      {item.label}
    </a>
  );
}

export default function Header({ hideHamburger = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [expandedMobileGroup, setExpandedMobileGroup] = useState(null);
  const [member, setMember] = useState(() => getStoredMember());
  const [loggingOut, setLoggingOut] = useState(false);
  const touchStartY = useRef(null);
  const scrollTargetRef = useRef(0);
  const scrollRafRef = useRef(null);

  useEffect(() => {
    setMember(isLoggedIn() ? getStoredMember() : null);
  }, [location.pathname, location.search]);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    closeHoverMenu();
    closeMenu();

    try {
      await logoutMember();
    } catch {
      /* ignore */
    }

    clearAuth();
    setMember(null);

    // 같은 주소에서 새로고침 — 로그아웃 후 화면·권한이 한 번 갱신됨
    navigate(0);
  };

  useEffect(() => {
    if (hideHamburger && menuOpen) {
      setMenuOpen(false);
      setExpandedMobileGroup(null);
    }
  }, [hideHamburger, menuOpen]);

  useEffect(() => {
    document.body.classList.toggle("nav-all-open", menuOpen);

    if (!menuOpen) {
      touchStartY.current = null;
      if (scrollRafRef.current) {
        cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
      return undefined;
    }

    scrollTargetRef.current = window.scrollY;

    const clampScroll = (value) => {
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );
      return Math.max(0, Math.min(maxScroll, value));
    };

    const animateScroll = () => {
      const current = window.scrollY;
      const delta = scrollTargetRef.current - current;

      if (Math.abs(delta) < 0.5) {
        window.scrollTo(0, scrollTargetRef.current);
        scrollRafRef.current = null;
        return;
      }

      window.scrollTo(0, current + delta * 0.2);
      scrollRafRef.current = requestAnimationFrame(animateScroll);
    };

    const queueScroll = (delta) => {
      scrollTargetRef.current = clampScroll(scrollTargetRef.current + delta);
      if (!scrollRafRef.current) {
        scrollRafRef.current = requestAnimationFrame(animateScroll);
      }
    };

    const syncWheelScroll = (event) => {
      event.preventDefault();
      queueScroll(event.deltaY);
    };

    const onTouchStart = (event) => {
      touchStartY.current = event.touches[0]?.clientY ?? null;
      scrollTargetRef.current = window.scrollY;
    };

    const onTouchMove = (event) => {
      const currentY = event.touches[0]?.clientY;
      if (currentY == null || touchStartY.current == null) return;
      event.preventDefault();
      const delta = touchStartY.current - currentY;
      touchStartY.current = currentY;
      queueScroll(delta);
    };

    const navAll = document.getElementById("nav_all");
    navAll?.addEventListener("wheel", syncWheelScroll, { passive: false });
    navAll?.addEventListener("touchstart", onTouchStart, { passive: true });
    navAll?.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      document.body.classList.remove("nav-all-open");
      navAll?.removeEventListener("wheel", syncWheelScroll);
      navAll?.removeEventListener("touchstart", onTouchStart);
      navAll?.removeEventListener("touchmove", onTouchMove);
      if (scrollRafRef.current) {
        cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
      touchStartY.current = null;
    };
  }, [menuOpen]);

  const handleMenuEnter = (index) => {
    if (window.innerWidth > 1050) {
      setHoveredMenu(index);
    }
  };

  const handleNavLeave = (event) => {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return;
    }
    setHoveredMenu(null);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setExpandedMobileGroup(null);
  };
  const closeHoverMenu = () => setHoveredMenu(null);

  const toggleMobileGroup = (index) => {
    if (window.innerWidth > 1240) return;
    setExpandedMobileGroup((prev) => (prev === index ? null : index));
  };

  const handleTopLinkClick = (event, target) => {
    event.preventDefault();
    navigate(target);
    closeHoverMenu();
  };

  const openMenu = () => {
    setMenuOpen(true);
    setExpandedMobileGroup(null);
  };

  const mobileMenu = (
    <div id="nav_all" className={menuOpen ? "active" : ""} onClick={closeMenu}>
      <div
        id="all_menu"
        onClick={(event) => event.stopPropagation()}
        className={menuOpen ? "active" : ""}
      >
        <div className="nav_all_logo">
          <img src={assets.logoWhite} alt="한화그린" />
        </div>
        <ul className="menu_ul">
          {navGroups.map((group, index) => (
            <li
              key={group.title}
              className={`menu_li gnb_al_li_plus${
                expandedMobileGroup === index ? " is-expanded" : ""
              }`}
              style={{ zIndex: 999 - index }}
            >
              <button
                type="button"
                className={`menu_tit${expandedMobileGroup === index ? " on" : ""}`}
                onClick={() => toggleMobileGroup(index)}
              >
                {group.title} <Icon name="chevron-down" size="sm" />
              </button>
              <div className="all_box">
                <ul className="all_ul">
                  {group.items.map((item) => (
                    <li key={item.label} className="all_li">
                      <AppNavLink item={item} className="all_tit" onNavigate={closeMenu} />
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="all_menu_close"
          aria-label="메뉴 닫기"
          onClick={closeMenu}
        >
          ×
        </button>
      </div>
    </div>
  );

  return (
    <>
      <header id="header">
        <div className="inner">
          <div className="inner-top">
            <ul className="tp_link">
              {topLinks.map((link) => {
                const target = parseAppHref(link.href);
                return (
                  <li key={link.label}>
                    {target ? (
                      <a
                        href={`${target.pathname}${target.search}`}
                        onClick={(event) => handleTopLinkClick(event, target)}
                      >
                        <Icon name={link.icon} size="sm" />
                        <p>{link.label}</p>
                      </a>
                    ) : (
                      <a href={link.href} onClick={(event) => event.preventDefault()}>
                        <Icon name={link.icon} size="sm" />
                        <p>{link.label}</p>
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="logo">
              <Link to="/" onClick={closeHoverMenu}>
                <img src={assets.logoBlack} alt="한화그린" />
              </Link>
            </div>
            <div className="userBox">
              <ul>
                <li>
                  {member ? (
                    <>
                      <span className="header-user-name">
                        <Icon name="lock" size="sm" className="login-icon" />{" "}
                        {member.name || member.id}님
                      </span>
                      <button
                        type="button"
                        className="header-logout-btn"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        aria-busy={loggingOut}
                      >
                        {loggingOut ? "로그아웃 중…" : "로그아웃"}
                      </button>
                    </>
                  ) : (
                    <Link to="/bbs/login.php" onClick={closeHoverMenu}>
                      <Icon name="lock" size="sm" className="login-icon" /> 로그인
                    </Link>
                  )}
                </li>
              </ul>
              {!hideHamburger && (
                <button
                  type="button"
                  className="hamburger"
                  aria-label="전체 메뉴"
                  onClick={openMenu}
                >
                  <span className="ham_line" />
                  <span className="ham_line" />
                  <span className="ham_line" />
                </button>
              )}
            </div>
          </div>

          <div className="header-nav-wrap" onMouseLeave={handleNavLeave}>
            <div id="nav">
              <nav>
                <ul className="menu_ul">
                  {navGroups.map((group, index) => (
                    <li
                      key={group.title}
                      className={`menu_li gnb_al_li_plus${
                        hoveredMenu === index ? " is-active" : ""
                      }`}
                      style={{ zIndex: 999 - index }}
                      onMouseEnter={() => handleMenuEnter(index)}
                    >
                      <a href="#" className="menu_tit" onClick={(event) => event.preventDefault()}>
                        {group.title}
                      </a>
                      <div
                        className={`gnb_box${hoveredMenu === index ? " is-open" : ""}`}
                        onMouseEnter={() => handleMenuEnter(index)}
                      >
                        <div className="inner">
                          <ul className="gnb_ul">
                            {group.items.map((item) => (
                              <li key={item.label} className="gnb_li">
                                <AppNavLink
                                  item={item}
                                  className="gnb_a"
                                  onAfterNavigate={closeHoverMenu}
                                />
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="clearfix" />
              </nav>
            </div>
            <div
              className={`gnb_box_back${hoveredMenu !== null ? " is-visible" : ""}`}
              aria-hidden="true"
            />
          </div>
        </div>
      </header>

      {!hideHamburger && typeof document !== "undefined"
        ? createPortal(mobileMenu, document.body)
        : null}
    </>
  );
}
