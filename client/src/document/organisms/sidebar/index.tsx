import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import throttle from "lodash.throttle";
import { Button } from "../../../ui/atoms/button";

import { useUIStatus } from "../../../ui-context";

import "./index.scss";

function CalculateSidebarOnScroll() {
  useEffect(function mount() {
    function calcOnScroll() {
      let sidebar = document.getElementById("sidebar-quicklinks");
      if (sidebar) {
        let sidebarTop = sidebar.getBoundingClientRect().top;
        let sidebarTopString = sidebarTop.toString();
        let sidebarTopPx = sidebarTopString + "px";
        document.documentElement.style.setProperty(
          "--visible-height-of-header",
          sidebarTopPx
        );
      }
    }

    window.addEventListener(
      "scroll",
      throttle(calcOnScroll, 30, {
        leading: true,
        trailing: true,
      })
    );

    return function unMount() {
      window.removeEventListener("scroll", calcOnScroll);
    };
  });

  return null;
}

function _setScrollLock(isSidebarOpen) {
  const mainContentElement = document.querySelector("main");

  if (isSidebarOpen) {
    document.body.style.overflow = "hidden";
    if (mainContentElement) {
      mainContentElement.style.overflow = "hidden";
    }
  } else {
    document.body.style.overflow = "";
    if (mainContentElement) {
      mainContentElement.style.overflow = "";
    }
  }
}

function SidebarContainer({ children }) {
  const { isSidebarOpen, setIsSidebarOpen } = useUIStatus();
  const [classes, setClasses] = useState<string>("sidebar");

  useEffect(() => {
    if (isSidebarOpen) {
      setClasses("sidebar is-expanded");
    } else {
      setClasses("sidebar is-animating");
      setTimeout(() => {
        setClasses("sidebar");
      }, 300);
    }

    _setScrollLock(isSidebarOpen);
  }, [isSidebarOpen]);

  return (
    <>
      <nav id="sidebar-quicklinks" className={classes}>
        <Button
          extraClasses="backdrop"
          type="action"
          onClickHandler={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="sidebar-inner">{children}</div>
      </nav>
      <CalculateSidebarOnScroll />
    </>
  );
}

export function RenderSideBar({ doc }) {
  if (!doc.related_content) {
    if (doc.sidebarHTML) {
      return (
        <SidebarContainer>
          <h4 className="sidebar-heading">Related Topics</h4>
          <div
            dangerouslySetInnerHTML={{
              __html: `${doc.sidebarHTML}`,
            }}
          />
        </SidebarContainer>
      );
    }
    return null;
  }
  return doc.related_content.map((node) => (
    <SidebarLeaf key={node.title} parent={node} />
  ));
}

function SidebarLeaf({ parent }) {
  return (
    <SidebarContainer>
      <h4 className="sidebar-heading">{parent.title}</h4>
      <ul>
        {parent.content.map((node) => {
          if (node.content) {
            return (
              <li key={node.title}>
                <SidebarLeaflets node={node} />
              </li>
            );
          } else {
            return (
              <li key={node.uri}>
                <Link to={node.uri}>{node.title}</Link>
              </li>
            );
          }
        })}
      </ul>
    </SidebarContainer>
  );
}

function SidebarLeaflets({ node }) {
  return (
    <details open={node.open}>
      <summary>
        {node.uri ? <Link to={node.uri}>{node.title}</Link> : node.title}
      </summary>
      <ol>
        {node.content.map((childNode) => {
          if (childNode.content) {
            return (
              <li key={childNode.title}>
                <SidebarLeaflets node={childNode} />
              </li>
            );
          } else {
            return (
              <li
                key={childNode.uri}
                className={childNode.isActive && "active"}
              >
                <Link to={childNode.uri}>{childNode.title}</Link>
              </li>
            );
          }
        })}
      </ol>
    </details>
  );
}
