import { useState, useEffect, useMemo } from "react";
import { debounce } from "lodash";

const useUserFilter = (users) => {
    const [searchEmail, setSearchEmail] = useState("");
    const [filterRole, setFilterRole] = useState("");
    const [debouncedEmail, setDebouncedEmail] = useState("");

    // debounce
    useEffect(() => {
        const handler = debounce(() => {
            setDebouncedEmail(searchEmail);
        }, 300);

        handler();

        return () => handler.cancel();
    }, [searchEmail]);

    // filter
    const filteredUsers = useMemo(() => {
        return users.filter((u) => u.email.toLowerCase().includes(debouncedEmail.toLowerCase()) && (filterRole === "" || u.user_type === filterRole));
    }, [users, debouncedEmail, filterRole]);

    return {
        searchEmail,
        setSearchEmail,
        filterRole,
        setFilterRole,
        filteredUsers,
    };
};

export default useUserFilter;
