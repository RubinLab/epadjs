import React from "react";
import { css } from "@emotion/core";
// First way to import
import { ClipLoader } from "react-spinners";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const circleSpinner = ({ loading, unit, size }) => {
  return (
    <div>
      <ClipLoader
        css={override}
        sizeUnit={unit}
        size={size}
        color={"#9B9B9B"}
        loading={loading}
      />
    </div>
  );
};

export default circleSpinner;
