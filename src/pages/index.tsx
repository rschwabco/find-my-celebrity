import React, { useState, useRef, useEffect } from "react";
import { Camera, CameraType } from "react-camera-pro";
import { useRouter } from "next/router";
import {
  Container,
  Card,
  Row,
  Text,
  Col,
  Button,
  Spacer,
  Grid,
  css,
  Image as NextImage,
  Loading,
} from "@nextui-org/react";
const imagePath = `https://image.tmdb.org/t/p/h632/`;

type Profile = {
  birthday: string;
  name: string;
  place_of_birth: string;
  popularity: number;
  profile_path: string;
} | null;

type QueryResult =
  | {
      metadata?: Profile;
      confidence?: number;
    }
  | undefined;

export default function Home() {
  const ratio = 16 / 9;
  const camera = useRef<CameraType>(null);
  const [numberOfCameras, setNumberOfCameras] = useState(0);
  const [image, setImage] = useState(null);

  // const [profiles, setProfiles] = useState<Profile[]>(null);
  const [results, setResults] = useState<QueryResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  const capture = () => {
    if (camera.current) {
      const imageSrc = camera.current.takePhoto();
      //@ts-ignore
      rotateImage(imageSrc, 0, async (image) => {
        setImage(image);
        setLoading(true);
        const result = await fetch("/api/detectCelebrity", {
          method: "POST",
          body: JSON.stringify({
            image,
          }),
        });
        setLoading(false);
        const { results } = await result.json();
        console.log("RES", results);
        setResults(results);
      });
    }
  };

  const rotateImage = (imageBase64: string, rotation: number, cb: Function) => {
    //@ts-ignore
    var img = new Image();
    img.src = imageBase64;
    img.onload = () => {
      var canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      var ctx = canvas.getContext("2d");
      ctx?.translate(canvas.width, 0);
      ctx?.scale(-1, 1);
      ctx?.drawImage(img, 0, 0);
      cb(canvas.toDataURL("image/jpeg"));
    };
  };

  return (
    <Container css={{ height: "100vh" }}>
      <Container gap={2} justify="center">
        <Col css={{ justifyContent: "center", padding: 20 }}>
          <Row justify="center">
            <Text h1>Find your Celebrity</Text>
          </Row>
          <Row justify="center">
            <Card css={{ width: "60%" }}>
              <Camera
                ref={camera}
                numberOfCamerasCallback={setNumberOfCameras}
                facingMode="user"
                aspectRatio={ratio}
                errorMessages={{
                  noCameraAccessible: "No camera access",
                  permissionDenied: "No camera access",
                }}
              />
            </Card>
          </Row>
          <Row justify="center" css={{ padding: 20 }}>
            <Button onClick={capture}>Take a photo</Button>
          </Row>
          <Row justify="center">
            {loading && (
              <span>
                Processing...
                <Loading css={{ marginLeft: 20 }} />
              </span>
            )}
            {!loading && <Spacer></Spacer>}
          </Row>
        </Col>
      </Container>
      <Container css={{ height: "60vh" }}>
        <Row justify="center">
          {results &&
            results.map((result, key) => {
              return (
                <Col key={key} css={{ justifyContent: "center" }}>
                  <Row justify="center">
                    <Card css={{ height: "60%", width: "60%", margin: 10 }}>
                      <NextImage
                        src={`${imagePath}${result?.metadata?.profile_path}`}
                        alt="profile"
                        objectFit="cover"
                        autoResize
                      />
                    </Card>
                  </Row>
                  <Row justify="center">
                    <Text h3>
                      {result?.metadata?.name} (
                      {result?.confidence &&
                        (result.confidence * 100).toFixed(2)}
                      %)
                    </Text>
                  </Row>
                </Col>
              );
            })}

          {!results &&
            [1, 2, 3].map((_, key) => {
              return (
                <Col key={key} css={{ justifyContent: "center" }}>
                  <Row justify="center">
                    <Card
                      css={{
                        height: "10vh",
                        width: "10vw",
                        verticalAlign: "middle",
                        justifyContent: "center",
                      }}
                    >
                      <Container>
                        <Col>
                          <Row justify="center">
                            <Text h1>?</Text>
                          </Row>
                        </Col>
                      </Container>
                    </Card>
                  </Row>
                </Col>
              );
            })}
        </Row>
      </Container>
    </Container>
  );
}
