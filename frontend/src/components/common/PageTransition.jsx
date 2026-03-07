import { useRef, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// Page order for determining slide direction
const PAGE_ORDER = [
    "/dashboard",
    "/transactions",
    "/reports",
    "/budget",
    "/calendar",
    "/savings",
    "/split",
    "/profile",
];

export default function PageTransition({ children }) {
    const location = useLocation();
    const [displayChildren, setDisplayChildren] = useState(children);
    const [transitionClass, setTransitionClass] = useState("page-enter");
    const prevPath = useRef(location.pathname);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            prevPath.current = location.pathname;
            return;
        }

        const oldIdx = PAGE_ORDER.indexOf(prevPath.current);
        const newIdx = PAGE_ORDER.indexOf(location.pathname);

        // Determine direction
        let direction = "fade";
        if (oldIdx !== -1 && newIdx !== -1) {
            direction = newIdx > oldIdx ? "slide-left" : "slide-right";
        }

        // Start exit animation
        setTransitionClass(`page-exit-${direction}`);

        const exitTimer = setTimeout(() => {
            // Swap content
            setDisplayChildren(children);
            // Start enter animation
            setTransitionClass(`page-enter-${direction}`);

            const enterTimer = setTimeout(() => {
                setTransitionClass("page-visible");
            }, 400);

            return () => clearTimeout(enterTimer);
        }, 200);

        prevPath.current = location.pathname;
        return () => clearTimeout(exitTimer);
    }, [location.pathname, children]);

    return (
        <div className={`page-transition ${transitionClass}`}>
            {displayChildren}
        </div>
    );
}
