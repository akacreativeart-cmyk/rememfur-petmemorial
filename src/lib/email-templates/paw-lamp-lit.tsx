import React from "react";
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  ownerName?: string;
  petName?: string;
  litByName?: string;
  message?: string;
  memorialUrl?: string;
}

const Email = ({ ownerName, petName, litByName, message, memorialUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{litByName ?? "Someone"} lit a paw lamp for {petName ?? "your pet"}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>Rememfur</Text>
        <Heading style={heading}>A paw lamp glows for {petName ?? "your pet"}</Heading>
        <Text style={text}>{ownerName ? `Hi ${ownerName},` : "Hi there,"}</Text>
        <Text style={text}>
          {litByName ?? "Someone"} just lit a paw lamp on {petName ?? "your pet"}'s memorial.
          Their light shines a little brighter tonight.
        </Text>
        {message ? (
          <Section style={quoteBox}>
            <Text style={quote}>"{message}"</Text>
          </Section>
        ) : null}
        {memorialUrl ? (
          <Button style={button} href={memorialUrl}>
            Visit {petName ?? "their"}'s memorial
          </Button>
        ) : null}
        <Text style={footer}>With warmth, The Rememfur Team</Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `A paw lamp glows for ${d.petName ?? "your pet"}`,
  displayName: "Paw lamp lit",
  previewData: {
    ownerName: "Jane",
    petName: "Biscuit",
    litByName: "Tom",
    message: "Thinking of you both tonight.",
    memorialUrl: "https://rememfur.com/memorial/biscuit",
  },
} satisfies TemplateEntry;

const main = { backgroundColor: "#ffffff", fontFamily: "Georgia, 'Times New Roman', serif" };
const container = { padding: "32px 28px", maxWidth: "560px" };
const brand = { color: "#6D3F62", fontSize: "13px", letterSpacing: "3px", textTransform: "uppercase" as const, margin: "0 0 18px" };
const heading = { color: "#2C2422", fontSize: "24px", fontWeight: "600" as const, margin: "0 0 16px" };
const text = { color: "#2C2422", fontSize: "15px", lineHeight: "24px", margin: "0 0 14px" };
const quoteBox = { backgroundColor: "#FBF7F2", borderLeft: "3px solid #E8B96D", padding: "12px 16px", margin: "0 0 18px" };
const quote = { color: "#6D3F62", fontSize: "15px", fontStyle: "italic" as const, margin: "0" };
const button = { backgroundColor: "#6D3F62", color: "#FBF7F2", borderRadius: "999px", padding: "12px 26px", fontSize: "14px", textDecoration: "none", display: "inline-block", margin: "6px 0 20px" };
const footer = { color: "#8a7f7a", fontSize: "13px", margin: "18px 0 0" };
