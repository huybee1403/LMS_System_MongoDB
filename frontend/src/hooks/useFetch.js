import { useState, useEffect, useCallback } from "react";

const useFetch = (apiFunc, params = null, auto = true) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = useCallback(
        async (customParams = params) => {
            try {
                setLoading(true);
                setError(null);

                const res = await apiFunc(customParams);
                setData(res);
            } catch (err) {
                console.error("Fetch failed:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        },
        [apiFunc, params],
    );

    useEffect(() => {
        if (auto) {
            fetchData();
        }
    }, [fetchData, auto]);

    return {
        data,
        setData,
        loading,
        error,
        refetch: fetchData,
    };
};

export default useFetch;
