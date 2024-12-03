"use client";

import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Button, Chip } from "@nextui-org/react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import toast from "react-hot-toast";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82ca9d",
];

const validationColors = {
  REAL: "success",
  FAKE: "danger",
  UNVERIFIED: "default",
};

const ministryMapping = require("../../ministryList.json");

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("GPE");
  const [newsData, setNewsData] = useState([]);
  const [trendingNewsList, setTrendingNewsList] = useState([]);
  const [additionalData, setAdditionalData] = useState(null);

  const fetchTrendingNewsData = async () => {
    const trending = getTrendingNews();
    console.log(trending);
    const titles = trending.map((news) => news.titles[0].title);

    try {
      const response = await fetch(`http://localhost:5000/api/news/find`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ titles }),
      });
      if (response.status !== 200) {
        throw new Error("Failed to fetch news analysis data");
      }
      const data = await response.json();
      setTrendingNewsList(data);
    } catch (error) {
      toast.error("Failed to fetch news analysis data");
      console.error("Failed to fetch news analysis data");
    }
  };

  const fetchNewsAnalysis = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/get-analysis-json");
      const additionalResponse = await fetch(
        "http://localhost:8000/get-analysis-json2"
      );

      if (response.status !== 200 || additionalResponse.status !== 200) {
        throw new Error("Failed to fetch news analysis data");
      }

      const data = await response.json();
      const additionalData = await additionalResponse.json();

      setNewsData(data);
      setAdditionalData(additionalData);
    } catch (error) {
      toast.error("Failed to fetch news analysis data");
      console.error("Failed to fetch news analysis data");
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryData = (category) => {
    return newsData[category].map((item) => ({
      name: item.noun_label,
      value: item.subclusters.reduce(
        (acc, subcluster) => acc + subcluster.titles.length,
        0
      ),
    }));
  };

  const getSentimentData = (category) => {
    const sentiments = ["positive", "negative", "neutral"];
    return sentiments.map((sentiment) => ({
      name: sentiment,
      value: newsData[category].reduce(
        (acc, item) =>
          acc +
          item.subclusters.reduce(
            (subAcc, subcluster) =>
              subAcc + (subcluster.sentiment_distribution[sentiment] || 0),
            0
          ),
        0
      ),
    }));
  };

  const getCommonWords = (category) => {
    const words = {};
    newsData[category].forEach((item) => {
      item.subclusters.forEach((subcluster) => {
        subcluster.common_words.forEach((word) => {
          words[word] = (words[word] || 0) + 1;
        });
      });
    });
    return Object.entries(words)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  };

  const getTrendingNews = () => {
    let allNews = [];
    Object.values(newsData).forEach((category) => {
      category.forEach((item) => {
        item.subclusters.forEach((subcluster) => {
          allNews = allNews.concat(subcluster);
        });
      });
    });
    return allNews
      .sort((a, b) => b.sentiment_list.length - a.sentiment_list.length)
      .slice(0, 5);
  };

  useEffect(() => {
    fetchNewsAnalysis();
  }, []);

  useEffect(() => {
    fetchTrendingNewsData();
  }, [newsData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p className="font-semibold text-3xl animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold mb-8 mx-8 text-left"
      >
        Clustered News Overview
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="col-span-full"
        >
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">
                News Distribution by Category
              </h2>
              <div className="flex space-x-2">
                {Object.keys(newsData).map((category) => (
                  <Button
                    key={category}
                    size="sm"
                    color={activeCategory === category ? "primary" : "default"}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getCategoryData(activeCategory)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold">Sentiment Distribution</h2>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getSentimentData(activeCategory)}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {getSentimentData(activeCategory).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold">Common Words</h2>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={getCommonWords(activeCategory)}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </motion.div>
        <br />
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold my-8 text-center"
        >
          Overall News Overview
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.4 }}
          className="col-span-full"
        >
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold">Data Overview</h2>
            </CardHeader>
            <CardBody>
              <p className="text-lg">
                Total number of articles analyzed: {additionalData.length_data}
              </p>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold">Top News Sources</h2>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={Object.entries(additionalData.top_sources).map(
                    ([name, value]) => ({ name, value })
                  )}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold">Top Ministries</h2>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={Object.entries(additionalData.top_ministries).map(
                      ([name, value]) => ({
                        name: ministryMapping[name],
                        value,
                      })
                    )}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {Object.entries(additionalData.top_ministries).map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      )
                    )}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold">Sentiment Analysis</h2>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={Object.entries(additionalData.sentiment_analysis).map(
                      ([name, value]) => ({ name, value })
                    )}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {Object.entries(additionalData.sentiment_analysis).map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      )
                    )}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="col-span-full"
        >
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold">Trending News</h2>
            </CardHeader>
            <CardBody>
              <ul className="space-y-4">
                {trendingNewsList.map((news, index) => (
                  <li key={index} className="flex items-center space-x-4">
                    {/* <ArrowTrendingUpIcon className="w-6 h-6 text-blue-500" /> */}
                    <div>
                      <p className="font-semibold">{news.title}</p>
                      <p className="text-sm text-gray-500">
                        Source: {news.source}
                      </p>
                      <div>
                        {news.validation && (
                          <div className="my-2 flex gap-2 items-center">
                            <p>Ministry validation: </p>
                            <Chip
                              color={validationColors[news.validation]}
                              variant="flat"
                            >
                              {news.validation}
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
                              {news.AIValidation}
                            </Chip>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
