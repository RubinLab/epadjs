import React from 'react';
import { Rnd } from 'react-rnd';

const style = { background: '#861737', borderRadius: '10px' };

const MinimizedReport = ({
  index,
  reportIndex,
  header,
  onExpand,
  onClose,
  count,
}) => {
  const closeReport = e => {
    const index = parseInt(e.target.dataset.index);
    const reportindex = parseInt(e.target.dataset.reportindex);
    onClose(index, reportindex);
  };

  return (
    <Rnd
      default={{
        x: 10 + 50 * count,
        y: window.innerHeight - 50,
      }}
      enableUserSelectHack={false}
    >
      <div data-index={index} data-reportindex={reportIndex} style={style}>
        <div className="minreport-header">
          <div
            className="minreport-header__title"
            style={header ? null : { marginRight: '50px' }}
          >
            {header || 'Waterfall'}{' '}
          </div>
          <div className="minreport-header__btngrp">
            <button
              className="minreport-header__btn"
              data-index={index}
              data-reportindex={reportIndex}
              onClick={onExpand}
            >
              {String.fromCharCode('0x25A1')}
            </button>
            <button
              className="minreport-header__btn --close"
              data-index={index}
              data-reportindex={reportIndex}
              onClick={closeReport}
            >
              {String.fromCharCode('0x2A09')}
            </button>
          </div>
        </div>
      </div>
    </Rnd>
  );
};

export default MinimizedReport;
