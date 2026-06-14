import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Dashboard crash:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 text-center">
          <h2 className="text-2xl font-bold text-red-600">
            Something went wrong
          </h2>
          <p className="mt-2 text-gray-600">
            Check console for the real error.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
