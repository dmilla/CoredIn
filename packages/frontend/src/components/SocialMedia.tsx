import { Flex, Icon, Link } from "@chakra-ui/react";
import { FC } from "react";
import { FaXTwitter, FaDiscord } from "react-icons/fa6";

type SocialMediaSize = {
  size: string;
  gap?: string;
  color?: string;
  showOnlyDiscord?: boolean;
};

export const SocialMedia: FC<SocialMediaSize> = ({
  size,
  gap,
  color,
  showOnlyDiscord
}) => (
  <Flex direction="row" justify="center" gap={gap}>
    {!showOnlyDiscord && (
      <Link href="https://twitter.com/cored_in" isExternal fontSize={size}>
        <Icon
          color={color}
          as={FaXTwitter}
          aria-label="X."
          _hover={{
            color: "brand.300"
          }}
        />
      </Link>
    )}
    <Link href="https://discord.gg/fhsyaEJ5VZ" isExternal fontSize={size}>
      <Icon
        color={color}
        as={FaDiscord}
        aria-label="Discord."
        _hover={{
          color: "brand.300"
        }}
      />
    </Link>
  </Flex>
);
