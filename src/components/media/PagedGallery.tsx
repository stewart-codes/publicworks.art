import Container from "react-bootstrap/Container";
import { Col, Form, Pagination, Row } from "react-bootstrap";
import { FC, useMemo, useState } from "react";
import { Gallery } from "./Gallery";
import { useRouter } from "next/router";
import { PagesToRender } from "../../../src/hooks/usePagination";

interface Props {
  totalNumTokens: number;
  workId: number;
  slug: string;
}

export const PagedGallery: FC<Props> = ({
  slug,
  totalNumTokens,
  workId,
}: Props) => {
  const router = useRouter();
  const pageIn =
    typeof router.query?.page === "string" &&
    Number.isFinite(parseInt(router.query.page))
      ? parseInt(router.query.page)
      : 1;
  const page = pageIn;
  // const [page, setPage] = useState<number>(pageIn);

  const limit = 9;

  const pages = useMemo(() => {
    const pages = [];
    const end = Math.ceil(totalNumTokens / limit);
    for (let i = 0; i < end; i++) {
      pages.push(i + 1);
    }
    return pages;
  }, [totalNumTokens]);

  const lastPage = useMemo(
    () => (pages.length > 0 ? pages[pages.length - 1] : 1),
    [pages]
  );

  const pagesToRender = useMemo(() => {
    const pagesToRender: number[] = [];
    const start = Math.max(1, page - 3);
    const end = Math.min(lastPage, page + 3);
    for (let i = start; i <= end; i++) {
      pagesToRender.push(i);
    }
    const ellipsisStart = !!(start > 1 && pagesToRender.length);
    const ellipsisEnd = end < lastPage;

    return { ellipsisStart, ellipsisEnd, pagesToRender };
  }, [page, lastPage]);

  const tokenIds = useMemo(() => {
    const tokenIds = [];
    const from = (page - 1) * limit + 1;
    const to = Math.min(from + limit - 1, totalNumTokens);
    for (let i = from; i <= to; i++) {
      tokenIds.push(i.toString());
    }
    return tokenIds;
  }, [lastPage, page, totalNumTokens]);

  const changePage = (page: number) => {
    const newPage = Math.max(pages[0], Math.min(page, pages[pages.length - 1]));
    router.push(`/work/${slug}?page=${newPage}`, undefined, {
      shallow: true,
      scroll: false,
    });

    // update whatever
    // window.scrollTo(0, 0);
  };

  return (
    <Container>
      <Form>
        <Form.Group className="mb-3" controlId="sortBy"></Form.Group>
      </Form>
      <Row>
        <Gallery slug={slug} workId={workId} tokenIds={tokenIds} />
      </Row>
      <Row>
        <Col />
        <Col>
          <div
            className={"text-center"}
            style={{ margin: "0 auto", width: "50%" }}
          >
            <PaginationComp
              pages={pages}
              page={page}
              changePage={changePage}
              pagesToRender={pagesToRender}
            ></PaginationComp>
          </div>
        </Col>
        <Col />
      </Row>
    </Container>
  );
};

export const PaginationComp = ({
  page,
  changePage,
  pagesToRender,
  pages,
}: {
  page: number;
  changePage: (n: number) => void;
  pagesToRender: PagesToRender;
  pages: number[];
}) => {
  const lastPage = pages[pages.length - 1];
  return (
    <Pagination>
      <Pagination.First disabled={page === 1} onClick={() => changePage(1)} />
      <Pagination.Prev
        disabled={page === 1}
        onClick={() => changePage(page - 1)}
      />
      {pagesToRender.ellipsisStart && <Pagination.Ellipsis />}
      {pagesToRender.pagesToRender.map((pageN: number) => (
        <Pagination.Item
          key={pageN}
          active={pageN === page}
          onClick={() => changePage(pageN)}
        >
          {pageN}
        </Pagination.Item>
      ))}
      {pagesToRender.ellipsisEnd && <Pagination.Ellipsis />}
      <Pagination.Next
        disabled={page === lastPage}
        onClick={() => changePage(page + 1)}
      />
      <Pagination.Last
        disabled={page === lastPage}
        onClick={() => changePage(lastPage)}
      />
    </Pagination>
  );
};
