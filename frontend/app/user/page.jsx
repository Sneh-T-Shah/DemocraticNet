"use client";
import React, { useContext, useEffect, useState } from "react";
import {
  Tabs,
  Tab,
  Card,
  CardBody,
  CardFooter,
  Dropdown,
  DropdownTrigger,
  Button,
  DropdownMenu,
  DropdownItem,
  Input,
  CardHeader,
  Image,
  Chip,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  RadioGroup,
  Radio,
} from "@nextui-org/react";
import { FlagIcon, NewspaperIcon, SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import AppContext from "../../context/AppContext";

const ministryMapping = require("../../ministryList.json");

const sentiments = ["POSITIVE", "NEUTRAL", "NEGATIVE"];
const validations = ["REAL", "FAKE"];

const newsCardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

const sentimentColors = {
  POSITIVE: "success",
  NEUTRAL: "default",
  NEGATIVE: "danger",
};

const validationColors = {
  REAL: "success",
  FAKE: "danger",
  UNVERIFIED: "default",
};

const Page = () => {
  const router = useRouter();
  const { user } = useContext(AppContext);
  const [selectedSentiment, setSelectedSentiment] = useState(new Set([]));
  const [selectedValidation, setSelectedValidation] = useState(new Set([]));
  const [searchQuery, setSearchQuery] = useState("");
  const [newsList, setNewsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUpdateValidation, setSelectedUpdateValidation] = useState("");
  const [selectedNews, setSelectedNews] = useState(null);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const fetchNews = async () => {
    setIsLoading(true);

    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      router.push("/login");
    }

    try {
      const sentimentQuery =
        "?&sentiment=" + Array.from(selectedSentiment).join(",");
      const validationQuery =
        "&validation=" + Array.from(selectedValidation).join(",");

      const url = `http://localhost:5000/api/ministry/news/${sentimentQuery}${validationQuery}`;

      await new Promise((r) => setTimeout(r, 200));
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          authToken: authToken,
        },
      });

      if (response.status !== 200) {
        throw new Error("Failed to fetch news");
      }

      const data = await response.json();
      setNewsList(data);
    } catch (error) {
      console.error("Failed to fetch news", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportNews = async () => {
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      router.push("/login");
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/ministry/news/${selectedNews._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            authToken: authToken,
          },
          body: JSON.stringify({
            validation: selectedUpdateValidation,
          }),
        }
      );

      if (response.status !== 200) {
        toast.error("Failed to report news");
        throw new Error("Failed to report news");
      }

      toast.success("News reported successfully");
      fetchNews();
      onClose();
    } catch (error) {
      console.error("Failed to report news", error);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [selectedSentiment, selectedValidation]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedUpdateValidation("");
      setSelectedNews(null);
    }
  }, [isOpen]);

  return (
    <div>
      <NewsReportingModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        selectedUpdateValidation={selectedUpdateValidation}
        setSelectedUpdateValidation={setSelectedUpdateValidation}
        selectedNews={selectedNews}
        handleReportNews={handleReportNews}
      />
      <Tabs aria-label="Options" isVertical={true}>
        <Tab
          key="news"
          title={
            <div className="flex items-center space-x-2">
              <NewspaperIcon />
              <span>News</span>
            </div>
          }
          className="w-full"
        >
          <Card className="h-[90vh]">
            <CardHeader className="flex flex-row gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button color="primary">
                    {selectedSentiment.size > 0
                      ? `${selectedSentiment.size} selected`
                      : "Filter by Sentiment"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Ministry selection"
                  selectionMode="multiple"
                  selectedKeys={selectedSentiment}
                  onSelectionChange={setSelectedSentiment}
                >
                  {sentiments.map((sentiment, index) => (
                    <DropdownItem key={sentiment} value={index + 1}>
                      {sentiment}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              <Dropdown>
                <DropdownTrigger>
                  <Button color="primary">
                    {selectedValidation.size > 0
                      ? `${selectedValidation.size} selected`
                      : "Filter by Validation"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Ministry selection"
                  selectionMode="multiple"
                  selectedKeys={selectedValidation}
                  onSelectionChange={setSelectedValidation}
                >
                  {validations.map((validation, index) => (
                    <DropdownItem key={validation} value={index + 1}>
                      {validation}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              <Input
                className="max-w-xs"
                placeholder="Search news..."
                startContent={
                  <SearchIcon className="text-default-400" size={20} />
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </CardHeader>
            <CardBody className="">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Spinner size="lg" />
                </div>
              ) : (
                <>
                  {newsList.length === 0 ? (
                    <div className="flex w-full h-full justify-center items-center text-default-400">
                      <p>No news found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {newsList.map((news, index) => (
                        <motion.div
                          key={news._id}
                          variants={newsCardVariants}
                          initial="hidden"
                          animate="visible"
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                          <Card className="max-w-md">
                            <CardBody className="overflow-visible p-0">
                              {news.imageurl ? (
                                <Image
                                  shadow="sm"
                                  radius="lg"
                                  width="100%"
                                  alt={news.title}
                                  className="w-full object-cover h-[200px]"
                                  src={news.imageurl}
                                />
                              ) : (
                                <div className="w-full h-[200px] bg-gray-200 flex items-center justify-center">
                                  <p className="text-gray-500">
                                    No image available
                                  </p>
                                </div>
                              )}
                            </CardBody>
                            <CardFooter className="text-small flex-col items-start">
                              <h4 className="font-bold text-large">
                                {news.title}
                              </h4>
                              <p className="text-default-500 my-1">
                                {news.description == "nullcontent is : null"
                                  ? "No Description"
                                  : news.description}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Chip
                                  color={sentimentColors[news.sentiment]}
                                  variant="flat"
                                >
                                  {news.sentiment}
                                </Chip>
                                <Chip
                                  color={validationColors[news.validation]}
                                  variant="flat"
                                >
                                  {news.validation}
                                </Chip>
                                <Chip color="primary" variant="flat">
                                  {news.tag}
                                </Chip>
                              </div>
                              <div className="my-2">
                                <p className="font-semibold">Ministries:</p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {news.ministry.map((ministryId) => (
                                    <Chip
                                      key={ministryId}
                                      size="sm"
                                      variant="flat"
                                    >
                                      {ministryMapping[ministryId]}
                                    </Chip>
                                  ))}
                                </div>
                              </div>
                              <div className="flex justify-between w-full mt-3">
                                <span className="text-default-400">
                                  {new Date(news.publishedAt).toLocaleString()}
                                </span>
                                <span className="text-default-400">
                                  {news.author}
                                </span>
                              </div>
                              <div className="flex gap-2 items-center my-3">
                                <Button
                                  color="primary"
                                  size="sm"
                                  variant="flat"
                                  as="a"
                                  href={news.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Read More
                                </Button>
                                <Button
                                  onClick={() => {
                                    setSelectedNews(news);
                                    onOpen();
                                  }}
                                  color="danger"
                                  size="sm"
                                  variant="flat"
                                >
                                  Report <FlagIcon className="size-5" />
                                </Button>
                              </div>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardBody>
          </Card>
        </Tab>
        <Tab key="profile" title="Profile" className="w-full">
          <Card>
            <CardBody>
              <ProfileTabContent user={user} />
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

const NewsReportingModal = ({
  isOpen,
  onOpenChange,
  setSelectedUpdateValidation,
  selectedUpdateValidation,
  selectedNews,
  handleReportNews,
}) => {
  useEffect(() => {
    setSelectedUpdateValidation(selectedNews?.validation);
  }, [selectedNews]);

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Report News
              </ModalHeader>
              <ModalBody>
                <h4 className="font-bold text-large">{selectedNews?.title}</h4>

                <RadioGroup
                  value={selectedUpdateValidation}
                  onValueChange={setSelectedUpdateValidation}
                  label="select the validation"
                >
                  <Radio value="REAL">Real</Radio>
                  <Radio value="FAKE">Fake</Radio>
                </RadioGroup>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onClick={handleReportNews}>
                  Report
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

const ProfileTabContent = ({ user }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold">Profile</h1>
      <div className="flex flex-col gap-2 mt-4">
        <div className="flex gap-2 items-center">
          <span className="font-semibold">Name:</span>
          <span>{user.fullName}</span>
        </div>
        <div className="flex gap-2 items-center">
          <span className="font-semibold">Email:</span>
          <span>{user.email}</span>
        </div>
        <div className="flex gap-2 items-center">
          <span className="font-semibold">Role:</span>
          <span>{user.ministryId}</span>
        </div>
      </div>
    </div>
  );
};

export default Page;
