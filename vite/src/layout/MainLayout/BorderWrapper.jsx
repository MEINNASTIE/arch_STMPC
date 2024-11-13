import React from 'react';
import PropTypes from 'prop-types';

const BorderedWrapper = ({ children, borderStyle }) => {
  return (
    <div style={{ border: borderStyle || '42px solid rgb(238, 242, 246)'}}>
      {children}
    </div>
  );
};

BorderedWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  borderStyle: PropTypes.string
};

export default BorderedWrapper;
