import {graphql} from "gatsby";
import React, {FunctionComponent, useCallback} from "react";
import {useDispatch} from "react-redux";
import styled from "styled-components";
import {DocPageFragment} from "../../../graphql-types";
import {toggleAside, toggleTOC} from "../../state/common";
import {ArticleComments} from "../articles/article-comments";
import {ArticleContent, ArticleHeader, ArticleTitle} from "../articles/article-elements";
import {ArticleSections} from "../articles/article-sections";
import {Aside, DocPageAside} from "./doc-page-aside";
import {DocPageCommunity} from "./doc-page-community";
import {DocPageLegacy} from "./doc-page-legacy";
import {DocPageNavigation, Navigation} from "./doc-page-navigation";

import ListAltIconSvg from "../../images/list-alt.svg";
import NewspaperIconSvg from "../../images/newspaper.svg";
import {DocPageDesktopGridColumns, IsDesktop, IsMobile, IsSmallDesktop, IsTablet} from './shared-style';
import {Article} from '../articles/article';
import {ArticleWrapper, ArticleWrapperElement} from './doc-page-article-wrapper';

interface DocPageProperties {
  data: DocPageFragment;
  originPath: string;
}

export const DocPage: FunctionComponent<DocPageProperties> = ({
  data,
  originPath,
}) => {
  const dispatch = useDispatch();
  const { fields, frontmatter, html } = data.file!.childMarkdownRemark!;
  const slug = fields!.slug!.substring(1);
  const path = `/docs/${slug}`;
  const productAndVersionPattern = /^([\w-]*?)\/(v\d+)?/g;
  const result = productAndVersionPattern.exec(slug);
  const selectedProduct = result![1]! || "";
  const selectedVersion = (result && result[2]) || "";
  const title = frontmatter!.title!;

  const handleToggleTOC = useCallback(() => {
    dispatch(toggleTOC());
  }, []);

  const handleToggleAside = useCallback(() => {
    dispatch(toggleAside());
  }, []);

  return (
    <Container>
      <DocPageNavigation
        data={data}
        selectedPath={path}
        selectedProduct={selectedProduct}
        selectedVersion={selectedVersion}
      />
      <ArticleWrapper>
        <ArticleContainer>
          <Article>
            {false && <DocPageLegacy />}
            <ArticleHeader>
              <ResponsiveMenuWrapper>
                <ResponsiveMenu>
                  <Button onClick={handleToggleTOC} className="toc-toggle">
                    <ListAltIconSvg /> Table of contents
                  </Button>
                  <Button onClick={handleToggleAside} className="aside-toggle">
                    <NewspaperIconSvg /> About this article
                  </Button>
                </ResponsiveMenu>
              </ResponsiveMenuWrapper>
              <ArticleTitle>{title}</ArticleTitle>
            </ArticleHeader>
            <ArticleContent dangerouslySetInnerHTML={{ __html: html! }} />
          </Article>
          {false && <ArticleComments data={data} path={path} title={title} />}
        </ArticleContainer>
      </ArticleWrapper>
      <DocPageAside>
        <DocPageCommunity data={data} originPath={originPath} />
        <ArticleSections data={data.file!.childMarkdownRemark!} />
      </DocPageAside>
    </Container>
  );
};

export const DocPageGraphQLFragment = graphql`
  fragment DocPage on Query {
    file(
      sourceInstanceName: { eq: "docs" }
      relativePath: { eq: $originPath }
    ) {
      childMarkdownRemark {
        fields {
          slug
        }
        frontmatter {
          title
        }
        html
        ...ArticleSections
      }
    }
    ...ArticleComments
    ...DocPageCommunity
    ...DocPageNavigation
  }
`;

const ResponsiveMenuWrapper = styled.div`
  position: absolute;
  left: 0;
  right: 0;
`;

const ArticleContainer = styled.div`
  padding: 20px;
  grid-row: 1;
  grid-column: 3;

  ${IsSmallDesktop(`
      grid-column: 1;
      justify-self: center;
      margin-top: 50px;
  `)};

  @media only screen and (max-width: 820px) {
    width: 100%;
  }
`;

const Container = styled.div`
  display: grid;
  ${DocPageDesktopGridColumns};
  ${IsSmallDesktop(`
    grid-template-columns: 250px 1fr;
  `)}

  ${IsTablet(`
    grid-template-columns: 1fr;
  `)}

  grid-template-rows: 1fr;
  width: 100%;
  height: 100%;
  overflow: visible;

  ${Navigation} {
    grid-row: 1;
    grid-column: 2;

    ${IsSmallDesktop(`
      grid-column: 1;
    `)}
  }

  ${ArticleWrapperElement} {
    grid-row: 1;
    grid-column: 1 / 6;

    ${IsSmallDesktop(`
      grid-column: 2 / 5;
    `)}

    ${IsTablet(`
      grid-column: 1 / 5;
    `)}
  }

  ${Aside} {
    grid-row: 1;
    grid-column: 4;

    ${IsMobile(`
      grid-column: 1;
    `)}
  }
`;

const ResponsiveMenu = styled.div`
  position: fixed;
  width: 93%;
  top: 60px;
  box-sizing: border-box;
  z-index: 2;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 20px 20px 20px;
  background: linear-gradient(
    180deg,
    #ffffff 30%,
    rgba(255, 255, 255, 0.75) 100%
  );

  @media only screen and (min-width: 820px) {
    max-width: 800px
  }

  ${IsDesktop(`
    display: none;
  `)}

  ${IsSmallDesktop(`
    > .toc-toggle {
      display: none;
    }
  `)}

  ${IsTablet(`
    > .toc-toggle {
      display: initial;
    }
  `)}
`;

const Button = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  color: #666;
  transition: color 0.2s ease-in-out;

  &.aside-toggle {
    margin-left: auto;
  }

  &:hover {
    color: #000;

    > svg {
      fill: #000;
    }
  }

  > svg {
    margin-right: 5px;
    width: 16px;
    height: 16px;
    fill: #666;
    transition: fill 0.2s ease-in-out;
  }
`;
