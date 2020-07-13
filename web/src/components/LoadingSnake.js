// import React from "react";
import tw, { styled } from "twin.macro";

export const LoadingSnake = styled.div`
  ${tw`bg-purple-600 absolute`}
  width: 2px;
  height: 2px;
  top: -2px;
  left: -2px;
  animation: around 5s infinite;
  @keyframes around {
    0% {
      left: -2px;
      top: -2px;
      width: 2px;
      height: 2px;
    }
    12.5% {
      left: -2px;
      top: -2px;
      width: 100%;
      height: 2px;
    }
    25% {
      left: calc(100% - 1px);
      top: -2px;
      width: 2px;
      height: 2px;
    }
    37.5% {
      left: calc(100% - 1px);
      top: -2px;
      width: 2px;
      height: 100%;
    }
    50% {
      top: calc(100% - 1px);
      left: calc(100% - 1px);
      width: 2px;
      height: 2px;
    }
    62.5% {
      left: -2px;
      top: calc(100% - 1px);
      width: 100%;
      height: 2px;
    }
    75% {
      left: -2px;
      top: calc(100% - 1px);
      width: 2px;
      height: 2px;
    }
    87.5% {
      top: -2px;
      left: -2px;
      width: 2px;
      height: 100%;
    }
    100% {
      top: -2px;
      left: -2px;
      width: 2px;
      height: 2px;
    }
  }
`;
