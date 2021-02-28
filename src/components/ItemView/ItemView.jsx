import BorderContainer from '@/components/BorderContainer';
import ItemImage from '@/components/ItemView/ItemImage';
import useConstants from '@/hooks/useConstants';
import { Badge, Box, Container, Grow, IconButton, Tooltip, Typography } from '@material-ui/core';
import { InfoOutlined } from '@material-ui/icons';
import React, { forwardRef, memo } from 'react';

function ItemView(props, ref) {
  const { item, type = 'basic', active = false, badge, imageSize, imageProps, ...rest } = props;

  const { assetUrl, name, categories, description, info, infoLink } = item;

  const [basicInfoSx, wikiSx] = useConstants([
    { pb: 1, display: 'flex', flexDirection: 'column' },
    { position: 'absolute', top: 8, right: 8 },
  ]);

  const showWikiIcon = type !== 'image';
  const showBasicInfo = type !== 'image';

  return (
    <BorderContainer
      ref={ref}
      component={Badge}
      active={active}
      badgeContent={badge}
      invisible={badge == null}
      color='primary'
      {...rest}
    >
      <Box display='flex' flexDirection='row' alignItems='stretch' position='relative'>
        <Tooltip title='Wiki' placement='top' arrow>
          <Grow in={showWikiIcon}>
            <IconButton href={infoLink} size='small' target='_blank' sx={wikiSx}>
              <InfoOutlined fontSize='inherit' />
            </IconButton>
          </Grow>
        </Tooltip>

        <ItemImage
          src={assetUrl}
          flexShrink='0'
          alignSelf='flex-start'
          size={imageSize}
          {...imageProps}
        />

        {showBasicInfo && (
          <Container sx={basicInfoSx}>
            <Typography
              component={Box}
              width='calc(100% - 12px)'
              variant='subtitle1'
              display='flex'
              flexDirection='row'
              alignItems='center'
              justifyContent='space-between'
              title={name}
            >
              {name}
            </Typography>
            <Typography variant='caption'>{categories?.join(', ')}</Typography>
            <Typography variant='body2' color='text.secondary'>
              {description}
            </Typography>
          </Container>
        )}
      </Box>
    </BorderContainer>
  );
}

ItemView = memo(forwardRef(ItemView));

export default ItemView;
