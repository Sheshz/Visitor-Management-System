import { useState, useEffect, useCallback } from "react";
import apiClient from "../utils/apiClient";

const useVisitorData = () => {
  const [visitorData, setVisitorData] = useState(null);
  const [activeVisitors, setActiveVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Improved endpoint availability check - uses relative URLs consistently
  const checkEndpointAvailability = async (endpoint) => {
    try {
      await apiClient.head(endpoint);
      return true;
    } catch (error) {
      console.log(`${endpoint} endpoint not available`);
      return false;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found");
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      if (!isMounted) return;
      setLoading(true);
      setError(null);

      try {
        // Check if current visitor endpoint exists before attempting to fetch
        const currentVisitorAvailable = await checkEndpointAvailability("/api/visitors/current");
        
        if (currentVisitorAvailable) {
          try {
            const visitorResponse = await apiClient.get("/api/visitors/current");
            if (isMounted) {
              setVisitorData(visitorResponse.data);
            }
          } catch (visitorError) {
            if (isMounted) {
              console.error("Error fetching current visitor:", visitorError);
              setVisitorData(null);
            }
          }
        } else {
          console.log("Current visitor endpoint not available");
          if (isMounted) {
            setVisitorData(null); // Set null as fallback
          }
        }

        // Check if active visitors endpoint exists before attempting to fetch
        const activeVisitorsAvailable = await checkEndpointAvailability("/api/visitors/active");
        
        if (activeVisitorsAvailable) {
          try {
            const activeResponse = await apiClient.get("/api/visitors/active");
            if (isMounted) {
              setActiveVisitors(activeResponse.data || []);
            }
          } catch (activeError) {
            if (isMounted) {
              console.error("Error fetching active visitors:", activeError);
              setActiveVisitors([]);
            }
          }
        } else {
          console.log("Active visitors endpoint not available");
          if (isMounted) {
            setActiveVisitors([]); // Set empty array as fallback
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error in visitor data fetch flow:", err);
          setError(err.response?.data?.message || "Failed to fetch visitor data");
          setVisitorData(null);
          setActiveVisitors([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Initial data load
    fetchData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array means this runs once on mount

  // Function to refresh data
  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if current visitor endpoint exists before attempting to fetch
      const currentVisitorAvailable = await checkEndpointAvailability("/api/visitors/current");
      
      if (currentVisitorAvailable) {
        try {
          const visitorResponse = await apiClient.get("/api/visitors/current");
          setVisitorData(visitorResponse.data);
        } catch (visitorError) {
          console.error("Error refreshing current visitor:", visitorError);
          setVisitorData(null);
        }
      } else {
        console.log("Current visitor endpoint not available");
        setVisitorData(null); // Set null as fallback
      }

      // Check if active visitors endpoint exists before attempting to fetch
      const activeVisitorsAvailable = await checkEndpointAvailability("/api/visitors/active");
      
      if (activeVisitorsAvailable) {
        try {
          const activeResponse = await apiClient.get("/api/visitors/active");
          setActiveVisitors(activeResponse.data || []);
        } catch (activeError) {
          console.error("Error refreshing active visitors:", activeError);
          setActiveVisitors([]);
        }
      } else {
        console.log("Active visitors endpoint not available");
        setActiveVisitors([]); // Set empty array as fallback
      }
    } catch (err) {
      console.error("Error in visitor data refresh flow:", err);
      setError(err.response?.data?.message || "Failed to refresh visitor data");
      setVisitorData(null);
      setActiveVisitors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    visitorData,
    activeVisitors,
    loading,
    error,
    refreshData,
    hasActiveVisitors: activeVisitors.length > 0,
    visitorCount: activeVisitors.length,
  };
};

export default useVisitorData;