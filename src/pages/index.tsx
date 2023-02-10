import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { Camera, CameraType } from "react-camera-pro";
import {
  Container,
  Card,
  Row,
  Text,
  Col,
  Link,
  Button,
  Spacer,
  Grid,
  Image as NextImage,
  Loading,
} from "@nextui-org/react";
const imagePath = `https://image.tmdb.org/t/p/h632/`;
const profilePath = `https://www.themoviedb.org/person/`;

type Profile = {
  id: string;
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
        const { results } = await result.json();
        setLoading(false);
        setResults(results);
      });
    }
  };

  const rotateImage = (imageBase64: string, rotation: number, cb: Function) => {
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
            <Text
              css={{ textGradient: "45deg, $blue600 -20%, $pink600 50%" }}
              h1
              weight="extrabold"
            >
              Find your Celebrity
            </Text>
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
      <Container gap={2}>
        <Row justify="center">
          {results &&
            results.map((result, key) => {
              return (
                <Col key={key} css={{ justifyContent: "center" }}>
                  <Row justify="center" gap={3}>
                    <Card css={{ margin: 30 }}>
                      <Card.Header css={{ zIndex: 1, top: 5 }}>
                        <Grid.Container>
                          <Grid xs={8}>
                            <Link
                              color="primary"
                              target="_blank"
                              href={`${profilePath}${result?.metadata?.id}`}
                            >
                              <Text size={18} color="#ffffffAA">
                                {result?.metadata?.name}
                              </Text>
                            </Link>
                          </Grid>
                          <Grid xs={4} justify="flex-end">
                            <Text>
                              (
                              {result?.confidence &&
                                (result.confidence * 100).toFixed(2)}
                              %)
                            </Text>
                          </Grid>
                        </Grid.Container>
                      </Card.Header>

                      <Card.Divider />
                      <Card.Image
                        src={`${imagePath}${result?.metadata?.profile_path}`}
                        alt="profile"
                        objectFit="cover"
                        autoResize
                        loading={"lazy"}
                      ></Card.Image>
                      <Card.Footer>
                        <Col>
                          <Row>
                            <Text>
                              Birthday:{" "}
                              {result?.metadata?.birthday.replace(
                                "None",
                                "Unknown"
                              )}
                            </Text>
                          </Row>
                          <Row>
                            <Text>
                              Popularity: {result?.metadata?.popularity}
                            </Text>
                          </Row>
                        </Col>
                      </Card.Footer>
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
