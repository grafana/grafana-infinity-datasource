import React from 'react';
import Typewriter from 'typewriter-effect';
export const TypeWriter = () => {
  return (
    <>
      <h3 style={{ color: 'whitesmoke' }}>
        <Typewriter
          options={{
            autoStart: true,
            loop: true,
          }}
          onInit={(typewriter) => {
            typewriter
              .pasteString('Spice up Grafana with data from ', this)
              .typeString('CSV')
              .pauseFor(1000)
              .deleteChars(3)
              .typeString('JSON')
              .pauseFor(1000)
              .deleteChars(4)
              .typeString('GraphQL')
              .pauseFor(1000)
              .deleteChars(7)
              .typeString('XML')
              .pauseFor(1000)
              .deleteChars(3)
              .typeString('HTML')
              .pauseFor(1000)
              .deleteChars(4)
              .typeString('beautiful series')
              .pauseFor(1000)
              .deleteChars(16)
              .typeString('Infinity Datasource')
              .pauseFor(5000)
              .start();
          }}
        />
      </h3>
    </>
  );
};
