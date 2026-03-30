import { useEffect } from "react";

const useClickOutSide = (refs, callback) => {
    useEffect(() => {
        const handleClick = (event) => {
            const isOutside = refs.every((ref) => ref.current && !ref.current.contains(event.target));

            if (isOutside) {
                callback();
            }
        };

        document.addEventListener("mousedown", handleClick);

        return () => {
            document.removeEventListener("mousedown", handleClick);
        };
    }, [refs, callback]);
};

export default useClickOutSide;
