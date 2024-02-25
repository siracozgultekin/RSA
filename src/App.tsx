import { useCallback, useState } from "react";
import { toast } from "sonner";

import { Button } from "./components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

import "./App.css";

function App() {
  const [n, setN] = useState<number>(0);
  const [z, setZ] = useState<number>(0);
  const [e, setE] = useState<number>(0);
  const [d, setD] = useState<number>(0);
  const [p, setP] = useState<number>(0);
  const [q, setQ] = useState<number>(0);

  const [plaintext, setPlaintext] = useState<string>("");
  const [ciphertext, setCiphertext] = useState<string>("");
  const [nonencryptedDecArr, setNonencryptedDecArr] = useState<number[]>([]);
  const [encryptedDecArr, setEncryptedDecArr] = useState<number[]>([]);
  const [hexStr, setHexStr] = useState<string>("");

  const checkPrime = (num: number) => {
    for (let i = 2; i < num; i++) {
      // 2'den başlayarak num'a kadar olan sayıları döngüye sokuyoruz. çünkü en küçük asal sayı 2'dir
      if (num % i === 0) return false; // 1 dışında bir sayıya bölünüyorsa asal değildir
    }
    return num > 1; // 1'den büyükse asaldır
  };

  const relativePrime = (a: number, b: number): boolean => {
    if (a === 0 || b === 0) return false;
    if (a === 1 || b === 1) return true; // 1 her sayı ile asaldır
    if (a === b) return false; // 1 haricindeki aynı sayılar aralarında asal değildir

    for (let i = 2; i <= Math.min(a, b); i++) {
      if (a % i === 0 && b % i === 0) {
        // Eğer ortak bir bölen bulunursa, asal değildir
        return false;
      }
    }

    // Hiçbir ortak bölen bulunamazsa, asal olarak kabul edilir
    return true;
  };

  const calculateNandZ = () => {
    if (!checkPrime(p) || !checkPrime(q)) {
      toast.error("Please enter prime numbers");
      return;
    }

    setN(p * q);
    setZ((p - 1) * (q - 1));
  };

  const calculateKeys = () => {
    let eValue = document.getElementById("eValue") as HTMLInputElement;

    if (parseInt(eValue.value) >= n) {
      toast.error("Please enter valid value for e which is lower than n");
      return;
    }
    if (!relativePrime(parseInt(eValue.value), z)) {
      toast.error("Please enter valid value for e which is prime to z");
      return;
    }
    setE(parseInt(eValue.value));
    setD(modInverse(e, z));
  };

  function modInverse(e: number, z: number): number {
    e = e % z;
    for (let d = 1; d < z; d++) {
      if ((e * d) % z === 1) {
        return d;
      }
    }
    return -1; // Hesaplama başarısız oldu
  }

  const StrToDec = (str: string): Promise<number[]> => {
    return new Promise((resolve) => {
      let tempDecArr: number[] = [];

      for (let i = 0; i < str.length; i++) {
        let dec = str.charCodeAt(i);
        tempDecArr.push(dec);
      }

      resolve(tempDecArr);
    });
  };

  const DecToHex = (encryptedDecArr: number[]) => {
    let updatedHexStr = "";
    for (let i = 0; i < encryptedDecArr.length; i++) {
      let hexString = encryptedDecArr[i].toString(16);
      if (hexString.length < 4) {
        hexString.length === 3
          ? (hexString = "0" + hexString)
          : hexString.length === 2
          ? (hexString = "00" + hexString)
          : (hexString = "000" + hexString);
      }
      updatedHexStr += hexString; // Güncellenmiş hexStr'e hexString'i ekle
    }
    setHexStr(updatedHexStr); // Güncellenmiş hexStr'i state'e atayın
  };

  const ReverseHexToDec = (ciphertext: string): Promise<number[]> => {
    return new Promise((resolve) => {
      let decArr = [];
      for (let i = 0; i < ciphertext.length; i += 4) {
        let hex = ciphertext.slice(i, i + 4);
        let dec = parseInt(hex, 16);
        decArr.push(dec);
      }
      resolve(decArr);
    });
  };

  function modularExponentiation(
    base: number,
    exponent: number,
    modulus: number
  ): number {
    let result = 1;
    base = base % modulus; // Reduce base modulo modulus
    while (exponent > 0) {
      if (exponent % 2 === 1) {
        result = (result * base) % modulus;
      }
      exponent /= 2; // Equivalent to exponent >>= 1; using division
      base = (base * base) % modulus;
    }
    return result;
  }

  function cipherEncrypt(m: number, e: number, n: number): number {
    return modularExponentiation(m, e, n);
  }

  function cipherDecrypt(c: number, d: number, n: number): number {
    return modularExponentiation(c, d, n);
  }

  const encrypt = useCallback(
    (plaintext: string) => {
      StrToDec(plaintext).then((decArr) => {
        let encryptedDecArr: number[] = [];

        for (let i = 0; i < decArr.length; i++) {
          let result = cipherEncrypt(decArr[i], e, n);
          encryptedDecArr.push(result);
        }
        setEncryptedDecArr(encryptedDecArr);
        DecToHex(encryptedDecArr);
      });
    },
    [e, n, setEncryptedDecArr, DecToHex, setHexStr]
  );

  const decrypt = () => {
    ReverseHexToDec(ciphertext).then((reversed) => {
      let decryptedDecArr = [];

      for (let i = 0; i < reversed.length; i++) {
        let result = cipherDecrypt(reversed[i], d, n);
        decryptedDecArr.push(result);
      }

      setNonencryptedDecArr(decryptedDecArr);
    });
  };

  return (
    <div className="flex flex-col h-full items-center bg-slate-300">
      <Tabs defaultValue="keyselection" className="w-[700px] h-[500px]">
        <TabsList>
          <TabsTrigger value="keyselection">key selection</TabsTrigger>
          <TabsTrigger value="encryption">encryption</TabsTrigger>
          <TabsTrigger value="decryption">decryption</TabsTrigger>
        </TabsList>

        <TabsContent value="keyselection">
          <div className="h-[600px] items-center flex flex-col gap-8">
            <div className=" flex w-full justify-between p-10">
              <div className="flex gap-2">
                <p>Enter first prime number p:</p>
                <input
                  id="pValue"
                  value={p}
                  type="number"
                  className="h-fit w-12 text-center"
                  onChange={(e) => {
                    setP(parseInt(e.target.value));
                  }}
                />
              </div>
              <div className="flex gap-2">
                <p>Enter second prime number q:</p>
                <input
                  id="qValue"
                  value={q}
                  type="number"
                  className="h-fit w-12 text-center"
                  onChange={(e) => {
                    setQ(parseInt(e.target.value));
                  }}
                />
              </div>
            </div>{" "}
            <Button onClick={calculateNandZ}>Calculate n and z</Button>
            <div className="flex gap-10">
              <p>
                n is: <span className="bg-slate-300 px-2">{n}</span>
              </p>
              <p>
                z is: <span className="bg-slate-300 px-2">{z}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <p>Enter e(e &lt; n, prime to z):</p>
              <input
                id="eValue"
                value={e}
                type="number"
                className="h-fit w-12 text-center"
                onChange={(e) => {
                  setE(parseInt(e.target.value));
                }}
              />
            </div>
            <Button onClick={calculateKeys} className="mt-5">
              Calculate keys
            </Button>
            <div className="flex">
              <p>Public key is (e),(n) </p>
              <p>
                <span className="bg-slate-200 px-2 mx-2">{e}</span>,
                <span className="bg-slate-200 px-2 mx-2">{n}</span>,
              </p>
            </div>
            <div className="flex">
              <p>Private key is (d),(n) </p>{" "}
              <p>
                {" "}
                <span className="bg-slate-200 px-2 mx-2">{d}</span>,
                <span className="bg-slate-200 px-2 mx-2">{n}</span>,
              </p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="encryption">
          {" "}
          <div className="h-[600px] items-center flex flex-col gap-8">
            <div className=" flex w-full justify-between p-10">
              <div className="flex gap-2">
                <p>Your Public key is (e),(n) </p>
                <p>
                  <span className="bg-slate-200 px-2 mx-2">{e}</span>,
                  <span className="bg-slate-200 px-2 mx-2">{n}</span>,
                </p>
              </div>
              <Button>Copy</Button>
            </div>{" "}
            <div className="flex">
              <p>Enter plaintext:</p>
              <input
                type="text"
                className="h-fit mx-2"
                onChange={(e) => {
                  setPlaintext(e.target.value);
                }}
              />
            </div>
            <Button onClick={() => encrypt(plaintext)} className="mt-5">
              Encrypt
            </Button>
            <div className="flex gap-2">
              <p>Ciphertext(int):</p>
              <p className="bg-slate-300 px-2">
                {encryptedDecArr.join(",")}
              </p>{" "}
            </div>
            <div className="flex gap-2">
              <p>Ciphertext(in hex):</p>
              <p className="bg-slate-300 px-2">{hexStr}</p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="decryption">
          <div className="h-[600px] items-center flex flex-col gap-8">
            <div className=" flex w-full justify-between p-10">
              <div className="flex gap-2">
                <p>Your Private key is (d),(n) </p>
                <p>
                  <span className="bg-slate-200 px-2 mx-2">{d}</span>,
                  <span className="bg-slate-200 px-2 mx-2">{n}</span>,
                </p>
              </div>
              <Button>Copy</Button>
            </div>
            <p>your ciphertext {hexStr}</p>
            <div className="flex">
              <p>Enter Ciphertext:</p>
              <input
                value={ciphertext}
                type="text"
                className="h-fit "
                onChange={(e) => {
                  setCiphertext(e.target.value);
                }}
              />
            </div>
            <Button className="mt-5" onClick={decrypt}>
              Decrypt
            </Button>
            <div>nonencryptedDecArr: {nonencryptedDecArr.join(", ")}</div>
            <div>hexStr:: {hexStr}</div>
            <p>
              Reversed plaintext:{" "}
              {String.fromCharCode(...nonencryptedDecArr.reverse())}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default App;
