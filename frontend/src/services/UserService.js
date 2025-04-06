// Authentication service in your frontend app
//This contains the token management logic from my first response
export class UserService {
  constructor() {
    this.accessToken = localStorage.getItem("accessToken");
    this.refreshToken = localStorage.getItem("refreshToken");
    this.tokenExpiryTime = localStorage.getItem("tokenExpiry");

    // Set up a timer to refresh token before it expires
    this.setupRefreshTimer();
  }

  setupRefreshTimer() {
    if (!this.tokenExpiryTime) return;

    const currentTime = Date.now();
    const expiryTime = parseInt(this.tokenExpiryTime);
    const timeToExpiry = expiryTime - currentTime;

    // Refresh when 80% of token lifetime has passed
    const refreshTime = timeToExpiry * 0.8;

    if (refreshTime > 0) {
      this.refreshTimerId = setTimeout(
        () => this.refreshAccessToken(),
        refreshTime
      );
    }
  }

  async refreshAccessToken() {
    try {
      const response = await fetch("http://localhost:5000/api/user/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      const data = await response.json();

      if (response.ok) {
        this.accessToken = data.accessToken;

        // Calculate new expiry time (assuming JWT)
        const payload = JSON.parse(atob(data.accessToken.split(".")[1]));
        this.tokenExpiryTime = payload.exp * 1000; // Convert to milliseconds

        // Store updated values
        localStorage.setItem("accessToken", this.accessToken);
        localStorage.setItem("tokenExpiry", this.tokenExpiryTime);

        // Reset the refresh timer
        this.setupRefreshTimer();

        // Notify the warning modal to hide if visible
        window.dispatchEvent(new CustomEvent("tokenRefreshed"));
      } else {
        // Token refresh failed - user needs to login again
        this.logout();
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      this.logout();
    }
  }

  logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenExpiry");
    window.location.href = "/login";
  }
}
