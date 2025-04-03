import { Link, useLocation } from "react-router-dom";
import { Breadcrumbs, Typography, Tooltip } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";

const BreadcrumbsComponent = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav className="text-sm">
      <Breadcrumbs
        separator={<ChevronRight fontSize="small" />}
        aria-label="breadcrumb"
        sx={{
          color: "text.primary",
          display: "flex",
          flexWrap: "wrap",
          maxWidth: "100%",
          overflow: "hidden",
        }}
      >
        {/* Home Link */}
        <Link
          to="/"
          style={{
            color: "#1976d2",
            fontWeight: "500",
            textDecoration: "none",
            cursor: "pointer",
            padding: "0 8px",
          }}
        >
          Home
        </Link>

        {/* Breadcrumb Items */}
        {pathnames.length > 0 &&
          pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
            const isLast = index === pathnames.length - 1;

            return (
              <div key={name}>
                {isLast ? (
                  <Typography
                    sx={{
                      color: "text.secondary",
                      fontWeight: "600",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {name.replace("-", " ")}
                  </Typography>
                ) : (
                  <Link
                    to={routeTo}
                    style={{
                      color: "#1976d2",
                      fontWeight: "500",
                      textDecoration: "none",
                      padding: "0 8px",
                    }}
                  >
                    <span>{name.replace("-", " ")}</span>
                  </Link>
                )}
              </div>
            );
          })}
      </Breadcrumbs>
    </nav>
  );
};

export default BreadcrumbsComponent;
