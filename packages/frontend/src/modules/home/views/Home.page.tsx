import {
  Center,
  Flex,
  Heading,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VisuallyHidden
} from "@chakra-ui/react";
import { Feed } from "../components/Feed";
import { CreatePost } from "../components";
import { FEED_QUERIES } from "@/queries/FeedQueries";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { PostRequestType, SkillTag } from "@coredin/shared";
import { END_FEED_PHRASES } from "../components/post/constants";
import SkillFilter from "@/modules/home/components/SkillFilter"; // Import SkillFilter for reusable implementation
import { SkillTags } from "@coredin/shared"; // Import SkillTags for defining tags
import { FEED_MUTATIONS } from "@/queries/FeedMutations";
import { useCustomToast } from "@/hooks/useCustomToast";

const SCROLL_FETCH_DELAY_MS = 200;

enum FeedTabs {
  All = "All",
  Posts = "Posts",
  Offers = "Offers"
}

const HomePage = () => {
  const {
    data: posts,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage
  } = useInfiniteQuery({
    ...FEED_QUERIES.getFeed(),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.length === 0) {
        return undefined;
      }
      return lastPageParam + 1;
    },
    getPreviousPageParam: (firstPage, allPages, firstPageParam) => {
      if (firstPageParam <= 1) {
        return undefined;
      }
      return firstPageParam - 1;
    },
    refetchInterval: 5000, // TODO - increase slightly?
    refetchIntervalInBackground: true
  });

  // const queryClient = useQueryClient(); // Get queryClient from useQueryClient
  // const { mutate: mutateClearBoosts } = useMutation(
  //   FEED_MUTATIONS.clearBoosts()
  // );
  // const { successToast, errorToast } = useCustomToast();

  let timeoutId: string | number | NodeJS.Timeout | undefined;

  const checkInView = () => {
    clearTimeout(timeoutId);
    const element = document.querySelector(`#home-feed`);
    if (element) {
      const rect = element.getBoundingClientRect();
      if (rect.bottom < window.innerHeight && !isFetchingNextPage) {
        return new Promise(
          () =>
            (timeoutId = setTimeout(async () => {
              fetchNextPage();
            }, SCROLL_FETCH_DELAY_MS))
        );
      }
    }
  };

  useEffect(() => {
    document.addEventListener("scroll", checkInView);
    return () => {
      document.removeEventListener("scroll", checkInView);
    };
  }, []);

  const completeFeed = useMemo(
    () => posts?.pages.flatMap((page) => page) || [],
    [posts]
  );

  const postsOnly = useMemo(() => {
    return (
      posts?.pages
        .flatMap((page) => page)
        .filter((post) => !post.requestType) || []
    );
  }, [posts]);

  const [selectedTagsFilter, setSelectedTagsFilter] = useState<SkillTag[]>([]);

  const jobsAndGigsOnly = useMemo(() => {
    return (
      posts?.pages
        .flatMap((page) => page)
        .filter(
          (post) =>
            (selectedTagsFilter.length === 0 ||
              selectedTagsFilter.some((tag) => post.skillTags.includes(tag))) &&
            (post.requestType === PostRequestType.JOB ||
              post.requestType === PostRequestType.GIG)
        ) || []
    );
  }, [posts, selectedTagsFilter]);

  const randomEndFeedPhrase =
    END_FEED_PHRASES[Math.floor(Math.random() * END_FEED_PHRASES.length)];

  const [selectedTab, setSelectedTab] = useState<FeedTabs>(FeedTabs.All); // State to track the currently selected tab

  const handleTagChange = (tags: SkillTag[]) => {
    setSelectedTagsFilter(tags);
  };

  const handleTabChange = (tab: FeedTabs) => {
    setSelectedTab(tab);
  };

  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const tags = SkillTags.map((x) => x);

  return (
    <Flex
      direction="column"
      gap={{ base: "0.5em", lg: "1.5em" }}
      onScroll={checkInView}
    >
      <VisuallyHidden>
        <Heading as="h1">Home page, user feed</Heading>
      </VisuallyHidden>
      <CreatePost />
      <Tabs variant="softRounded" size="sm">
        <Flex
          alignItems={{ base: "flex-start", sm: "center" }}
          gap="1em"
          direction={{ base: "column", sm: "row" }}
          justifyContent="space-between"
        >
          <TabList>
            {Object.values(FeedTabs).map((tab) => (
              <Tab key={tab} onClick={() => handleTabChange(tab)}>
                {tab}
              </Tab>
            ))}
          </TabList>
          {/* <Button
            size="xs"
            colorScheme="green"
            onClick={async () => {
              try {
                await mutateClearBoosts();
                queryClient.invalidateQueries();
                successToast("All boosts have been reset");
              } catch (error) {
                console.error('Failed to reset boosts:', error);
                errorToast("Failed to reset boosts");
              }
            }}
          >
            Reset boosts
          </Button> */}
          {selectedTab === FeedTabs.Offers && (
            <SkillFilter
              isOpen={isOpen}
              onOpen={handleOpen}
              onClose={handleClose}
              onApply={handleTagChange}
              availableTags={tags.map((tag) => tag)}
              initialTags={selectedTagsFilter}
            />
          )}
        </Flex>
        <TabPanels id="home-feed">
          <TabPanel>
            <Feed posts={completeFeed} />
          </TabPanel>
          <TabPanel>
            <Feed posts={postsOnly} />
          </TabPanel>
          <TabPanel>
            <Feed posts={jobsAndGigsOnly} />
          </TabPanel>
          {isFetchingNextPage && (
            <Center mt="32px">
              <Spinner size="xl" color="brand.500" />
            </Center>
          )}
          {posts?.pages[0] && !hasNextPage && (
            <Text
              textStyle="sm"
              color="other.600"
              w="80%"
              mx="auto"
              textAlign="center"
            >
              {randomEndFeedPhrase}
            </Text>
          )}
        </TabPanels>
      </Tabs>
    </Flex>
  );
};

export default HomePage;
