import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true });
    // We should write a system to log the errors back to us like below
    // logErrorToMyService(error, info);
    console.log("Error: ", error, "Info: ", info);
  }

  render() {
    if (this.state.hasError) {
      // What is the fallback UI?
      // return <h1>Something went wrong.</h1>;
      return this.props.children;
    }
    return this.props.children;
  }
}
