// UpdateAssignee.js  (CLASS-BASED + PORTAL + FIXED)
import React from "react";
import PropTypes from "prop-types";
import { createPortal } from "react-dom";

// keep your own paths
import AssgineeDeletetionWarning from "./assigneeDeletionWarning";
import UserList from "./userList";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function computePosition(anchorRect, popupW, popupH, gap = 8) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // default below-left of anchor
  let top = anchorRect.bottom + gap;
  let left = anchorRect.left;

  // flip up if not enough room below
  if (top + popupH > vh) {
    top = Math.max(anchorRect.top - gap - popupH, gap);
  }

  // clamp horizontally
  left = clamp(left, gap, vw - popupW - gap);

  return { top, left };
}

class UpdateAssignee extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showWarning: false,
      warningList: [],
      isSelectedAll: 0,
      popupStyle: {
        position: "fixed",
        top: 0,
        left: 0,
        visibility: "hidden", // hide until measured & positioned
        zIndex: 2000,
        minWidth: 320,
        maxHeight: "60vh",
        overflow: "auto",
        border: "1px solid #ddd",
        borderRadius: 8,
        background: "#fff",
        boxShadow: "0 8px 24px rgba(0,0,0,.18)",
      },
    };

    this.popupRef = React.createRef();
    this._dims = { w: 360, h: 420 }; // initial guess

    this.handleDocClick = this.handleDocClick.bind(this);
    this.handleKey = this.handleKey.bind(this);
    this.measureAndPosition = this.measureAndPosition.bind(this);
    this.reposition = this.reposition.bind(this);
    this.toggleSelectAll = this.toggleSelectAll.bind(this);
    this.selectAssignee = this.selectAssignee.bind(this);
    this.checkWorklistDeletion = this.checkWorklistDeletion.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  componentDidMount() {
    // preserve your original "mount-only" logic
    if (Object.keys(this.props.assigneeList).length === this.props.users.length) {
      this.setState({ isSelectedAll: 1 });
    } else if (Object.keys(this.props.assigneeList).length > 0) {
      this.setState({ isSelectedAll: 2 });
    } else {
      this.setState({ isSelectedAll: 0 });
    }

    // listeners
    window.addEventListener("resize", this.reposition);
    window.addEventListener("scroll", this.reposition, true);
    document.addEventListener("mousedown", this.handleDocClick);
    document.addEventListener("keydown", this.handleKey);

    // position after first paint
    requestAnimationFrame(this.measureAndPosition);
  }

  componentDidUpdate(prevProps) {
    // if the anchor element changed, reposition
    if (prevProps.anchorEl !== this.props.anchorEl) {
      requestAnimationFrame(this.measureAndPosition);
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.reposition);
    window.removeEventListener("scroll", this.reposition, true);
    document.removeEventListener("mousedown", this.handleDocClick);
    document.removeEventListener("keydown", this.handleKey);
  }

  handleDocClick(e) {
    const t = e.target;
    if (this.popupRef.current && this.popupRef.current.contains(t)) return;
    if (this.props.anchorEl && this.props.anchorEl.contains(t)) return;
    this.props.onCancel();
  }

  handleKey(e) {
    if (e.key === "Escape") this.props.onCancel();
  }

  measureAndPosition() {
    if (!this.props.anchorEl) return;

    // Measure current popup (it must be in the DOM first)
    if (this.popupRef.current) {
      const r = this.popupRef.current.getBoundingClientRect();
      if (r.width && r.height) this._dims = { w: r.width, h: r.height };
    }

    const rect = this.props.anchorEl.getBoundingClientRect();
    const { w, h } = this._dims;
    const { top, left } = computePosition(rect, w, h);

    this.setState((s) => ({
      popupStyle: { ...s.popupStyle, top, left, visibility: "visible" },
    }));
  }

  reposition() {
    // quickly recompute based on the last measured size
    if (!this.props.anchorEl) return;
    const rect = this.props.anchorEl.getBoundingClientRect();
    const { w, h } = this._dims;
    const { top, left } = computePosition(rect, w, h);

    this.setState((s) => ({
      popupStyle: { ...s.popupStyle, top, left, visibility: "visible" },
    }));
  }

  toggleSelectAll(e) {
    let newSelected = {};
    const event = null;

    if (e.target.checked) {
      this.setState({ isSelectedAll: 1 });
      newSelected = (this.props.users || []).reduce((all, item) => {
        all[item.username] = true;
        return all;
      }, {});
    } else {
      this.setState({
        showWarning: false,
        warningList: { "all users": true }, // keep original behavior
        isSelectedAll: 0,
      });
    }
    this.props.selectAssignee(event, newSelected);
  }

  selectAssignee(e) {
    this.setState({ isSelectedAll: 2 });
    this.props.selectAssignee(e);
  }

  checkWorklistDeletion() {
    const warningList = [];
    const assigneeListKeys = Object.keys(this.props.assigneeList || {});
    for (let i = 0; i < assigneeListKeys.length; i += 1) {
      if (
        !this.props.assigneeList[assigneeListKeys[i]] &&
        this.props.initialAssignees.includes(assigneeListKeys[i])
      ) {
        warningList.push(this.props.userNameMap[assigneeListKeys[i]]);
      }
    }
    if (warningList.length > 0 || this.state.isSelectedAll === 0) {
      this.setState({ showWarning: true, warningList });
    } else {
      this.props.onSubmit();
    }
  }

  handleCancel() {
    this.setState({ showWarning: false, warningList: [] });
    this.props.onCancel();
  }

  render() {
    const popup = (
      <>
        {/* Fixed, anchored popup */}
        <div
          ref={this.popupRef}
          style={this.state.popupStyle}
          role="dialog"
          aria-modal="true"
          className="assign-users-portal"
        >
          <div style={{ padding: "10px 12px", fontWeight: 600, borderBottom: "1px solid #eee" }}>
            Update Assignees
          </div>

          <div style={{ padding: 8 }}>
            <UserList
              users={this.props.users}
              onChange={(e) => this.selectAssignee(e)}
              selectAll={(e) => this.toggleSelectAll(e)}
              assignees={this.props.assigneeList}
              isSelectedAll={this.state.isSelectedAll}
            />
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", padding: 12, borderTop: "1px solid #eee" }}>
            <button className="updateAssignee__modal--button" onClick={this.checkWorklistDeletion}>
              Submit
            </button>
            <button className="edit-permission__modal--button" onClick={this.props.onCancel}>
              Cancel
            </button>
          </div>
        </div>

        {this.state.showWarning && (
          <AssgineeDeletetionWarning
            warningList={this.state.warningList}
            onCancel={this.handleCancel}
            onSubmit={this.props.onSubmit}
            allSelected={this.state.isSelectedAll === 0}
          />
        )}
      </>
    );

    // Render outside (to BODY) so no overflow/transform/z-index bugs
    return createPortal(popup, document.body);
  }
}

UpdateAssignee.propTypes = {
  anchorEl: PropTypes.any,            // DOM element of clicked "Assignees" button
  users: PropTypes.array,
  assigneeList: PropTypes.object,
  initialAssignees: PropTypes.array,
  userNameMap: PropTypes.object,
  selectAssignee: PropTypes.func,
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
};

export default UpdateAssignee;
