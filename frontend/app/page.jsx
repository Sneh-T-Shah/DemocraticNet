"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardBody,
  CardFooter,
  Image,
  Button,
  Dropdown,
  Input,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
} from "@nextui-org/react";
import { SearchIcon } from "lucide-react";

const ministryMapping = require("../ministryList.json");

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

const sentiments = ["POSITIVE", "NEUTRAL", "NEGATIVE"];
const validations = ["REAL", "FAKE"];

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [newsList, setNewsList] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSentiment, setSelectedSentiment] = useState(new Set([]));
  const [selectedValidation, setSelectedValidation] = useState(new Set([]));

  const updateSorting = () => {
    const sortedNewsList = newsList.sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.publishedAt) - new Date(a.publishedAt);
      } else {
        return new Date(a.publishedAt) - new Date(b.publishedAt);
      }
    });

    setNewsList([...sortedNewsList]);
  };

  function toCapitalCase(str) {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  useEffect(() => {
    fetchNews();
  }, [selectedValidation, selectedSentiment, searchQuery]);

  useEffect(() => {
    updateSorting();
  }, [sortOrder]);

  const fetchNews = async () => {
    setIsLoading(true);

    const sentimentQuery =
      "?&sentiment=" + Array.from(selectedSentiment).join(",");
    const validationQuery =
      "&validation=" + Array.from(selectedValidation).join(",");

    const searchQueryParam = `&search=${searchQuery}`;

    const url = `http://localhost:5000/api/news/${sentimentQuery}${validationQuery}${searchQueryParam}`;

    console.log("url: ", url);

    try {
      const response = await fetch(url);
      if (response.status !== 200) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      setNewsList(data);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const newsCardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-2 px-4">
      {/* <h1 className="text-4xl font-bold mb-8">News Dashboard</h1> */}

      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-4 mb-2">
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

        <Dropdown>
          <DropdownTrigger>
            <Button color="success">
              Sort by:{" "}
              {sortOrder === "newest" ? "Newest First" : "Oldest First"}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Sort order selection"
            selectionMode="single"
            selectedKeys={new Set([sortOrder])}
            onSelectionChange={(keys) => setSortOrder(Array.from(keys)[0])}
          >
            <DropdownItem key="newest">Newest First</DropdownItem>
            <DropdownItem key="oldest">Oldest First</DropdownItem>
          </DropdownMenu>
        </Dropdown>

        <Input
          className="max-w-xs"
          placeholder="Search news..."
          startContent={<SearchIcon className="text-default-400" size={20} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <p>Loading news...</p>
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
                  <Image
                    shadow="sm"
                    radius="lg"
                    width="100%"
                    alt={news.title}
                    className="w-full object-cover h-[200px]"
                    src={
                      news.imageurl ||
                      "https://nbhc.ca/sites/default/files/styles/article/public/default_images/news-default-image%402x_0.png?itok=B4jML1jF"
                    }
                  />
                  {/* {news.imageurl ? (
                    
                  ) : (
                    <div className="w-full h-[200px] bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-500">No image available</p>
                    </div>
                  )} */}
                </CardBody>
                <CardFooter className="text-small flex-col items-start">
                  <h4 className="font-bold text-large">{news.title}</h4>
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
                      {toCapitalCase(news.sentiment)}
                    </Chip>
                    <Chip color="primary" variant="flat">
                      {news.tag}
                    </Chip>
                    <div>
                      {news.validation && (
                        <div className="my-2 flex gap-2 items-center">
                          <p>Ministry validation: </p>
                          <Chip
                            color={validationColors[news.validation]}
                            variant="flat"
                          >
                            {toCapitalCase(news.validation)}
                          </Chip>
                        </div>
                      )}

                      {news.AIValidation && (
                        <div className="my-2 flex gap-2 items-center">
                          <p>AI validation: </p>
                          <Chip
                            color={validationColors[news.AIValidation]}
                            variant="flat"
                          >
                            {toCapitalCase(news.AIValidation)}
                          </Chip>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="my-2">
                    <p className="font-semibold">Ministries:</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {news.ministry.map((ministryId) => (
                        <Chip key={ministryId} size="sm" variant="flat">
                          {ministryMapping[ministryId]}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between w-full mt-3">
                    <span className="text-default-400">
                      {new Date(news.publishedAt).toLocaleString()}
                    </span>
                    <span className="text-default-400">{news.source}</span>
                  </div>
                  <Button
                    className="mt-3"
                    color="primary"
                    radius="full"
                    size="sm"
                    variant="flat"
                    as="a"
                    href={news.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Read More
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
