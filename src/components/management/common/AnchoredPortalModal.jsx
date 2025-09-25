// AnchoredPortalModal.js
import React from "react";
import PropTypes from "prop-types";
import { createPortal } from "react-dom";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function computePosition(anchorRect, popupW, popupH, placement, gap) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // defaults
  let top = anchorRect.bottom + gap;
  let left = anchorRect.left;

  switch (placement) {
    case "bottom":
    case "bottom-start":
      top = anchorRect.bottom + gap;
      left = anchorRect.left;
      break;
    case "bottom-end":
      top = anchorRect.bottom + gap;
      left = anchorRect.right - popupW;
      break;
    case "top":
    case "top-start":
      top = anchorRect.top - popupH - gap;
      left = anchorRect.left;
      break;
    case "top-end":
      top = anchorRect.top - popupH - gap;
      left = anchorRect.right - popupW;
      break;
    case "right":
      top = anchorRect.top;
      left = anchorRect.right + gap;
      break;
    case "left":
      top = anchorRect.top;
      left = anchorRect.left - popupW - gap;
      break;
    default:
      break;
  }

  // simple flip logic for top/bottom
  if (placement.startsWith("bottom") && top + popupH > vh) {
    top = Math.max(anchorRect.top - popupH - gap, gap);
  } else if (placement.startsWith("top") && top < 0) {
    top = Math.min(anchorRect.bottom + gap, vh - popupH - gap);
  }

  // clamp to viewport horizontally & vertically
  left = clamp(left, gap, vw - popupW - gap);
  top = clamp(top, gap, vh - popupH - gap);

  return { top, left };
}

class AnchoredPortalModal extends React.Component {
  constructor(props) {
    super(props);
    this.containerRef = React.createRef(); // modal box
    this.state = {
      visible: false,
      style: {
        position: "fixed",
        top: 0,
        left: 0,
        visibility: "hidden",
        // zIndex: props.zIndex,
        minWidth: props.minWidth,
        maxWidth: props.maxWidth,
        // maxHeight: props.maxHeight,
        overflow: "auto",
        border: "1px solid #ddd",
        borderRadius: 8,
        background: "#343a40",
        boxShadow: "0 8px 24px rgba(0,0,0,.18)",
        ...props.style,
      },
    };
    this._dims = { w: props.minWidth || 320, h: 200 }; // initial guess

    this.onDocClick = this.onDocClick.bind(this);
    this.onKey = this.onKey.bind(this);
    this.reposition = this.reposition.bind(this);
    this.measureAndPosition = this.measureAndPosition.bind(this);
  }

  componentDidMount() {
    if (this.props.open) {
      this.addListeners();
      // position after paint
      requestAnimationFrame(this.measureAndPosition);
    }
  }

  componentDidUpdate(prevProps) {
    // open changed
    if (!prevProps.open && this.props.open) {
      this.addListeners();
      requestAnimationFrame(this.measureAndPosition);
    } else if (prevProps.open && !this.props.open) {
      this.removeListeners();
      this.setState({ visible: false });
    }

    // anchor changed while open
    if (this.props.open && prevProps.anchorEl !== this.props.anchorEl) {
      requestAnimationFrame(this.measureAndPosition);
    }
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  addListeners() {
    window.addEventListener("resize", this.reposition);
    window.addEventListener("scroll", this.reposition, true);
    document.addEventListener("click", this.onDocClick);
    document.addEventListener("keydown", this.onKey);
  }

  removeListeners() {
    window.removeEventListener("resize", this.reposition);
    window.removeEventListener("scroll", this.reposition, true);
    document.removeEventListener("click", this.onDocClick);
    document.removeEventListener("keydown", this.onKey);
  }

  onDocClick(e) {
    const { closeOnOutsideClick, onClose, anchorEl } = this.props;
    if (!closeOnOutsideClick) return;
    const t = e.target;
    if (this.containerRef.current && this.containerRef.current.contains(t)) return;
    if (anchorEl && anchorEl.contains && anchorEl.contains(t)) return;
    onClose && onClose();
  }

  onKey(e) {
    if (this.props.closeOnEsc && e.key === "Escape") {
      this.props.onClose && this.props.onClose();
    }
  }

  measureAndPosition() {
    if (!this.props.open) return;


    // measure
    if (this.containerRef.current) {
      const r = this.containerRef.current.getBoundingClientRect();
      if (r.width && r.height) this._dims = { w: r.width, h: r.height };
    }

    // anchor mode
    if (this.props.anchorEl) {
      const rect = this.props.anchorEl.getBoundingClientRect();
      let { top, left } = computePosition(
        rect,
        this._dims.w,
        this._dims.h,
        this.props.placement,
        this.props.offset
      );
      this.setState((s) => ({
        visible: true,
        style: { ...s.style, top, left, visibility: "visible" },
      }));
      return;
    }

    // center mode (no anchorEl)
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const top = clamp((vh - this._dims.h) / 2, 8, vh - this._dims.h - 8);
    let left = clamp((vw - this._dims.w) / 2, 8, vw - this._dims.w - 8);
    if (this.props.minusLeft) left = left - this.props.minusLeft;
    this.setState((s) => ({
      visible: true,
      style: { ...s.style, top, left, visibility: "visible" },
    }));
  }

  reposition() {
    // quick reposition using last measured size
    if (!this.props.open) return;
    if (this.props.anchorEl) {
      const rect = this.props.anchorEl.getBoundingClientRect();
      const { top, left } = computePosition(
        rect,
        this._dims.w,
        this._dims.h,
        this.props.placement,
        this.props.offset
      );
      this.setState((s) => ({
        style: { ...s.style, top, left, visibility: "visible" },
      }));
      return;
    }
    // center mode
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const top = clamp((vh - this._dims.h) / 2, 8, vh - this._dims.h - 8);
    let left = clamp((vw - this._dims.w) / 2, 8, vw - this._dims.w - 8);
    if (this.props.minusLeft) left = left - this.props.minusLeft;
    this.setState((s) => ({
      style: { ...s.style, top, left, visibility: "visible" },
    }));
  }

  renderBox() {
    const {
      title,
      children,
      className,
      headerClassName,
      bodyClassName,
      footer,
      footerClassName,
      showCloseButton,
      onClose,
    } = this.props;

    const liveStyle = { ...this.state.style, zIndex: this.props.zIndex };

    return (
      <div
        ref={this.containerRef}
        style={liveStyle}
        role="dialog"
        aria-modal="true"
        className={className || "apm-container"}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div
            className={headerClassName || "apm-header"}
            style={{
              padding: "10px 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #eee",
              fontWeight: 600,
            }}
          >
            <div>{title}</div>
            {showCloseButton && (
              <button
                onClick={onClose}
                aria-label="Close"
                style={{ border: 0, background: "transparent", fontSize: 18, lineHeight: 1, color: "#fff" }}
              >
                ×
              </button>
            )}
          </div>
        )}

        <div className={bodyClassName || "apm-body"} style={{ padding: "0px 8px" }}>
          {children}
        </div>

        {footer && (
          <div
            className={footerClassName || "apm-footer"}
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              padding: 12,
              borderTop: "1px solid #eee",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    );
  }

  render() {
    const { open, backdrop, backdropOpacity, zIndex } = this.props;
    if (!open) return null;

    const node = (
      <>
        {backdrop && (
          <div
            onClick={this.props.closeOnOutsideClick ? this.props.onClose : undefined}
            style={{
              position: "fixed",
              inset: 0,
              background: `rgba(0,0,0,${backdropOpacity})`,
              zIndex: (this.props.zIndex ?? 1000) - 1
            }}
          />
        )}
        {this.renderBox()}
      </>
    );

    return createPortal(node, document.body);
  }
}

AnchoredPortalModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  // Anchor mode: positions near this element; if absent, centers in viewport
  anchorEl: PropTypes.any,
  placement: PropTypes.oneOf([
    "bottom-start",
    "bottom-end",
    "bottom",
    "top-start",
    "top-end",
    "top",
    "left",
    "right",
  ]),
  offset: PropTypes.number,
  // Appearance
  title: PropTypes.node,
  children: PropTypes.node,
  footer: PropTypes.node,
  className: PropTypes.string,
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  footerClassName: PropTypes.string,
  style: PropTypes.object,
  zIndex: PropTypes.number,
  minWidth: PropTypes.number,
  maxWidth: PropTypes.number,
  maxHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  // Behavior
  closeOnOutsideClick: PropTypes.bool,
  closeOnEsc: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  backdrop: PropTypes.bool,
  backdropOpacity: PropTypes.number,
};

AnchoredPortalModal.defaultProps = {
  placement: "bottom-start",
  offset: 8,
  zIndex: 2000,
  minWidth: 320,
  maxWidth: 520,
  maxHeight: "60vh",
  closeOnOutsideClick: true,
  closeOnEsc: true,
  showCloseButton: false,
  backdrop: false,
  backdropOpacity: 0.25,
};

export default AnchoredPortalModal;
