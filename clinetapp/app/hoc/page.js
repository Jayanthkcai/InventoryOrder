// Higher Order Component
const withAuth = (WrappedComponent) => {
  return (props) => {
    const isAuthenticated = true; // Simulate authentication check
    return isAuthenticated ? (
      <WrappedComponent {...props} />
    ) : (
      <p>Please log in</p>
    );
  };
};

// Normal Component
const Dashboard = () => <h2>Welcome to the Dashboard</h2>;

// Wrap component with HOC
const ProtectedDashboard = withAuth(Dashboard);

export default function hocPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <ProtectedDashboard />;
    </div>
  );
}
