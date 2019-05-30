import React from "react";
import { css, jsx } from "@emotion/core";
// First way to import
import { BarLoader } from "react-spinners";

// const color = "#d0021b";
const color = "white";

const barLoader = ({ loading, height, width }) => {
  return (
    <div>
      <BarLoader
        // css={override}
        css={css`
          background-color: ${color};
        `}
        height={height}
        width={width}
        sizeUnit={"px"}
        // color={"#D0021B"}
        loading={loading}
      />
    </div>
  );
};

export default barLoader;
