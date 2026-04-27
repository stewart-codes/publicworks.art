import { Blog } from "../../blog/blogs";
import { Card } from "react-bootstrap";
import React from "react";
import styles from "./BlogCard.module.scss";
import Image from "next/image";
import Link from "next/link";
export const BlogCard = ({ blog }: { blog: Blog }) => {
  const url = `/blog/${blog.slug}`;
  return (
    // <Link href={url}>
    // </Link>
    <div className={"card w-75"}>
      <div className={"card-img-top overflow-hidden"}>
        <Link href={url}>
          <Image
            // fill={'cover'}
            // fill
            width={600}
            height={418}
            sizes="(max-width: 768px) 100vw,
              (max-width: 1200px) 50vw,
              33vw"
            alt={blog.title + " image"}
            src={blog.image || ""}
            // className={"card-img-top"}
            className={"w-100 h-100"}
            // className={styles.hoverZoom}
          />
        </Link>
      </div>
      {/*<Card.Img variant="top" src={blog.image} />*/}
      <div className={"card-body"}>
        {/*<Card.Body>*/}
        <Link href={url}>
          {/* @next-codemod-error This Link previously used the now removed `legacyBehavior` prop, and has a child that might not be an anchor. The codemod bailed out of lifting the child props to the Link. Check that the child component does not render an anchor, and potentially move the props manually to Link. */
          }
          <Card.Title>{blog.title}</Card.Title>
        </Link>
        <Card.Text>{blog.blurb}</Card.Text>
        {/*</Card.Body>*/}
      </div>
      {/*<ListGroup className="list-group-flush">*/}
      {/*  <ListGroup.Item>Cras justo odio</ListGroup.Item>*/}
      {/*  <ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>*/}
      {/*  <ListGroup.Item>Vestibulum at eros</ListGroup.Item>*/}
      {/*</ListGroup>*/}
      <Card.Body>
        <Card.Link href={url}>Read more</Card.Link>
      </Card.Body>
    </div>
  );
};
