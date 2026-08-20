/* eslint-disable @shopify/jsx-no-hardcoded-content */
import * as React from "react";
import { PropTypes } from "prop-types";

// Check if Vagaro login cookies exist (eB_2 for business, eU_2 for user)
const checkForVagaroCookies = () => {
  const cookies = document.cookie.split(";");
  const eB_2Cookie = cookies.find((cookie) => cookie.trim().startsWith("eB_2="));
  const eU_2Cookie = cookies.find((cookie) => cookie.trim().startsWith("eU_2="));
  return !!(eB_2Cookie || eU_2Cookie);
};

// Signed-in user menu. Lives in the header's top row (left of the locale
// flag) rather than in the main nav list, so a long display name can't push
// the nav items past the right edge of the viewport.
const UserMenu = ({ userInfo = {} }) => {
  const { userAvatar, userName } = userInfo;

  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  const isLoggedIn = checkForVagaroCookies();

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const toggle = (e) => {
    e.preventDefault();
    // Legacy dropdown code listens on document/body; let the click stop here so
    // it can't close the menu we're opening on the very same click.
    e.stopPropagation();
    setOpen((isOpen) => !isOpen);
  };

  if (!isLoggedIn) return null;

  return (
    <div className="user-info dropdown header-user-menu" ref={dropdownRef}>
      <button
        className="dropdown-toggle"
        data-react-dropdown=""
        onClick={toggle}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {userAvatar ? (
          <img
            src={userAvatar}
            alt={userName || "User profile"}
            className="user-avatar"
          />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="h-5 w-5 text-primary"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        )}
        {userName && (
          <span className="text-primary font-semibold header-user-menu__name">
            {userName}
          </span>
        )}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          focusable="false"
          viewBox="0 0 12 12"
          className="dropdown-chevron-icon"
          aria-hidden="true"
        >
          <path
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            d="M3 4.5l2.6 2.6c.2.2.5.2.7 0L9 4.5"
          />
        </svg>
      </button>
      {/* Display is driven from React state rather than the
          aria-expanded CSS rule, which any inline style set by other
          scripts would override. */}
      <div
        className="dropdown-menu dropdown-menu-end"
        role="menu"
        style={{ display: open ? "block" : "none" }}
      >
        <a
          href="/hc/en-us/profile"
          role="menuitem"
          onClick={() => setOpen(false)}
        >
          Profile
        </a>
        <a
          href="/hc/contributions/posts?locale=en-us"
          role="menuitem"
          onClick={() => setOpen(false)}
        >
          My Activities
        </a>
      </div>
    </div>
  );
};

UserMenu.propTypes = {
  userInfo: PropTypes.shape({
    isSignedIn: PropTypes.bool,
    userAvatar: PropTypes.string,
    userName: PropTypes.string,
  }),
};

export default UserMenu;
