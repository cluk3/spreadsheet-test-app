import React from "react";
import styled from "styled-components";
import "twin.macro";

const RippleContainer = styled.div`
  display: inline-block;
  position: relative;
  width: 120px;
  height: 120px;
`;
const FirstRipple = styled.div`
  position: absolute;
  border: 4px solid #fff;
  opacity: 1;
  border-radius: 50%;
  animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
  @keyframes lds-ripple {
    0% {
      top: 56px;
      left: 56px;
      width: 0;
      height: 0;
      opacity: 1;
    }
    100% {
      top: 0px;
      left: 0px;
      width: 112px;
      height: 112px;
      opacity: 0;
    }
  }
`;
const SecondRipple = styled(FirstRipple)`
  animation-delay: -0.5s;
`;

export const LoadingRipple = () => {
  return (
    <div tw="bg-black bg-opacity-75 absolute z-10 w-screen h-screen flex justify-center items-center">
      <RippleContainer>
        <FirstRipple />
        <SecondRipple />
      </RippleContainer>
    </div>
  );
};
