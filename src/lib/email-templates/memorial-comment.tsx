import React from "react";
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  ownerName?: string;
  petName?: string;
  authorName?: string;
  comment?: string;
  memorialUrl?: string;
}

const Email = ({ ownerName, petName, authorName, comment, memorialUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{authorName ?? "Someone"} left a message for {petName ?? "your pet"}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>Rememfur</Text>
        <Heading style={heading}>A kind word for {petName ?? "your pet"}</Heading>
        <Text style={text}>{ownerName ? `Hi ${ownerName},` : "Hi there,"}</Text>
        <Text style={text}>
          {authorName ?? "Someone"} shared a message on {petName ?? "your pet"}'s memorial.
        </Text>
        {comment ? (
          <Section style={quoteBox}>
            <Text style={quote}>"{comment}"</Text>
          </Section>
        ) : null}
        {memorialUrl ? (
          <Button style={button} href={memorialUrl}>
            Read it on {petName ?? "their"}'s page
          </Button>
        ) : null}
        <Text style={footer}>With warmth, The Rememfur Team</Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `A kind word for ${d.petName ?? "your pet"}`,
  displayName: "Memorial comment",
  previewData: {
    ownerName: "Jane",
    petName: "Biscuit",
    authorName: "Tom",
    comment: "Biscuit brought so much joy to everyone at the park.",
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
