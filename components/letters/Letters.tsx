import Image from "next/image";

const letterStyle = {
  width: "100%",
  height: "auto",
  aspectRatio: "246 / 234",
  objectFit: "contain" as const,
};

export function K() {
  return (
    <Image
      src="/letters/k.svg"
      alt="k"
      width={246}
      height={234}
      sizes="(max-width: 1000px) 14vw, 15vw"
      style={letterStyle}
    />
  );
}

export function R() {
  return (
    <Image
      src="/letters/r.svg"
      alt="r"
      width={246}
      height={234}
      sizes="(max-width: 1000px) 14vw, 15vw"
      style={letterStyle}
    />
  );
}

export function I() {
  return (
    <Image
      src="/letters/i.svg"
      alt="i"
      width={246}
      height={234}
      sizes="(max-width: 1000px) 14vw, 15vw"
      style={letterStyle}
    />
  );
}

export function P() {
  return (
    <Image
      src="/letters/p.svg"
      alt="p"
      width={246}
      height={234}
      sizes="(max-width: 1000px) 14vw, 15vw"
      style={letterStyle}
    />
  );
}

export function E() {
  return (
    <Image
      src="/letters/e.svg"
      alt="e"
      width={246}
      height={234}
      sizes="(max-width: 1000px) 14vw, 15vw"
      style={letterStyle}
    />
  );
}

export function S() {
  return (
    <Image
      src="/letters/s.svg"
      alt="s"
      width={246}
      height={234}
      sizes="(max-width: 1000px) 14vw, 15vw"
      style={letterStyle}
    />
  );
}

export function H() {
  return (
    <Image
      src="/letters/h.svg"
      alt="h"
      width={246}
      height={234}
      sizes="(max-width: 1000px) 14vw, 15vw"
      style={letterStyle}
    />
  );
}

export function G() {
  return (
    <Image
      src="/letters/g.svg"
      alt="g"
      width={246}
      height={234}
      sizes="(max-width: 1000px) 14vw, 15vw"
      style={letterStyle}
    />
  );
}

export function M() {
  return (
    <Image
      src="/letters/m.svg"
      alt="m"
      width={246}
      height={234}
      sizes="(max-width: 1000px) 14vw, 15vw"
      style={letterStyle}
    />
  );
}
